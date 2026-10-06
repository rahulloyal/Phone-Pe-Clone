from PIL import Image
import os

img = Image.open('Assets/UI Screenshots/WhatsApp Image 2026-10-04 at 16.45.58.jpeg')
w, h = img.size

print(f"Total size: {w}x{h}")

os.makedirs('Assets/extracted_icons', exist_ok=True)

# Let's inspect sections:
# Top gold banner: ~0 to 530
# Money transfer title & Refer badge: ~540 to 620
# 4 Money transfer icons: ~620 to 760
# 4 labels: ~760 to 820
# Promo cards: ~850 to 950
# Recharge & Bills title: ~970 to 1020
# 4 Recharge & Bills icons: ~1030 to 1180
# 4 labels: ~1180 to 1240
# Jio SIM & More pills: ~1240 to 1340
# Bottom nav: ~1440 to 1560

# Let's verify by saving test crops of each row
crop_gold = img.crop((0, 0, w, 540))
crop_gold.save('Assets/extracted_icons/test_gold.png')

crop_transfer = img.crop((0, 540, w, 840))
crop_transfer.save('Assets/extracted_icons/test_transfer.png')

crop_promo = img.crop((0, 840, w, 980))
crop_promo.save('Assets/extracted_icons/test_promo.png')

crop_recharge = img.crop((0, 980, w, 1400))
crop_recharge.save('Assets/extracted_icons/test_recharge.png')

crop_nav = img.crop((0, 1400, w, 1600))
crop_nav.save('Assets/extracted_icons/test_nav.png')

print("Saved test slices successfully.")
