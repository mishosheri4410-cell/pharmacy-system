import qrcode

url = input("Enter the URL where offer.html will be hosted: ").strip()
if not url:
    url = "https://YOUR-USERNAME.github.io/opencode/offer.html"
    print(f"Using default: {url}")

qr = qrcode.QRCode(box_size=12, border=4)
qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(fill_color="#0d47a1", back_color="white")
img.save("qrcode.png")
print("QR code saved as qrcode.png — print this and place it in your pharmacy.")
