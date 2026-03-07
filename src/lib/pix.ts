// PIX EMV QR Code payload generator (BR Code / BCB standard)

const PIX_KEY = "de70d50c-ce31-4ef1-bff5-5cfaccb26a7a";
const MERCHANT_NAME = "BELLARUS SISTEMAS";
const MERCHANT_CITY = "SAO PAULO";

function padTLV(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(amount: number, txId?: string): string {
  // Payload Format Indicator
  let payload = padTLV("00", "01");

  // Merchant Account Information (PIX)
  const gui = padTLV("00", "br.gov.bcb.pix");
  const key = padTLV("01", PIX_KEY);
  payload += padTLV("26", gui + key);

  // Merchant Category Code
  payload += padTLV("52", "0000");

  // Transaction Currency (986 = BRL)
  payload += padTLV("53", "986");

  // Transaction Amount
  if (amount > 0) {
    payload += padTLV("54", amount.toFixed(2));
  }

  // Country Code
  payload += padTLV("58", "BR");

  // Merchant Name
  payload += padTLV("59", MERCHANT_NAME.substring(0, 25));

  // Merchant City
  payload += padTLV("60", MERCHANT_CITY.substring(0, 15));

  // Additional Data Field (txid)
  if (txId) {
    const txField = padTLV("05", txId.substring(0, 25));
    payload += padTLV("62", txField);
  }

  // CRC16 placeholder then calculate
  payload += "6304";
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}

export { PIX_KEY };
