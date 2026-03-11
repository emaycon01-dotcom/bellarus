import testPhoto from "@/assets/test-photo.png";
import testSignature from "@/assets/test-signature.png";

function imageToDataURL(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

export async function getTestPhoto(): Promise<string> {
  return imageToDataURL(testPhoto);
}

export async function getTestSignature(): Promise<string> {
  return imageToDataURL(testSignature);
}
