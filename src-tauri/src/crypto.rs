use aes_gcm::{
    aead::{rand_core::RngCore, Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

/// 从机器特征派生一个 256-bit 加密密钥
/// 生产环境应使用 OS Keychain，当前阶段使用确定性派生
fn derive_machine_key() -> [u8; 32] {
    // TODO: 替换为 OS Keychain 存储（macOS Keychain / Windows Credential Manager）
    // 当前使用固定种子 + 机器信息派生，仅做开发阶段用途
    let mut key = [0u8; 32];
    let seed = b"xpouch-vault-encryption-key-v1";

    // 简单的 HKDF 替代：多次异或填充
    for (i, k) in key.iter_mut().enumerate() {
        *k = seed[i % seed.len()];
    }

    // 混入机器名增加不确定性
    if let Ok(hostname) = std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("HOSTNAME"))
        .or_else(|_| std::env::var("USER"))
    {
        for (i, b) in hostname.as_bytes().iter().enumerate() {
            key[i % 32] ^= b;
        }
    }

    key
}

/// 加密明文，返回 Base64 编码的 "nonce:ciphertext"
pub fn encrypt(plaintext: &str) -> Result<String, String> {
    let key = derive_machine_key();
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| e.to_string())?;

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| e.to_string())?;

    // 格式: base64(nonce || ciphertext)
    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    Ok(BASE64.encode(&combined))
}

/// 解密 Base64 编码的 "nonce:ciphertext"，返回明文
pub fn decrypt(encoded: &str) -> Result<String, String> {
    let key = derive_machine_key();
    let cipher = Aes256Gcm::new_from_slice(&key).map_err(|e| e.to_string())?;

    let combined = BASE64.decode(encoded).map_err(|e| e.to_string())?;
    if combined.len() < 12 {
        return Err("Invalid encrypted data: too short".to_string());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| e.to_string())?;

    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let original = "sk-proj-abc123456789xyz";
        let encrypted = encrypt(original).unwrap();
        let decrypted = decrypt(&encrypted).unwrap();
        assert_eq!(original, decrypted);
    }

    #[test]
    fn test_encrypt_produces_different_ciphertext() {
        let original = "sk-same-key";
        let enc1 = encrypt(original).unwrap();
        let enc2 = encrypt(original).unwrap();
        // 不同 nonce 产生不同密文
        assert_ne!(enc1, enc2);
    }
}
