import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export const TOTP = {
  generateSecret(email: string) {
    return speakeasy.generateSecret({
      name: `Enayah (${email})`,
    })
  },

  verify(token: string, secret: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    })
  },

  async generateQRCode(otpauthUrl: string) {
    return QRCode.toDataURL(otpauthUrl)
  },
}
