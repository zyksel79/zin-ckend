export function generateToken(userID: string, roomID: string) {
    // Demo token, production'da ZEGOCLOUD SDK kullanılmalı
    return `demo-token-${userID}-${roomID}-${Date.now()}`;
}
