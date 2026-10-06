from PIL import Image, ImageDraw
import os

img = Image.open('Assets/UI Screenshots/WhatsApp Image 2026-10-04 at 16.45.58.jpeg')
os.makedirs('Assets/icons', exist_ok=True)

def make_circle_crop(cropped_img):
    size = cropped_img.size
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(cropped_img.convert('RGBA'), (0, 0), mask=mask)
    return output

def remove_dark_bg(cropped_img, threshold=40):
    rgba = cropped_img.convert('RGBA')
    width, height = rgba.size
    for x in range(width):
        for y in range(height):
            r, g, b, a = rgba.getpixel((x, y))
            if r < threshold and g < threshold and b < threshold:
                rgba.putpixel((x, y), (0, 0, 0, 0))
    return rgba

# 1. Top Question Mark Icon
# In test_gold.png: x=633..681, y=105..153
# Let's extract the white question mark circle onto transparent background
help_box = img.crop((633, 105, 681, 153)).convert('RGBA')
w_h, h_h = help_box.size
# Transparent where not white/purple ring
# Or circular mask:
help_circle = make_circle_crop(help_box)
help_circle.save('Assets/icons/top_help.png')

# 2. Money Transfers 4 Icons
c1 = img.crop((47, 647, 163, 763))
make_circle_crop(c1).save('Assets/icons/to_mobile.png')

c2 = img.crop((218, 647, 334, 763))
make_circle_crop(c2).save('Assets/icons/to_bank.png')

# Wallet with Cashback badge:
# The circle + cashback badge:
# Circle is (389, 647, 505, 763). Cashback badge is (393, 626, 497, 656)
wallet_full = img.crop((385, 626, 509, 765))
wallet_full.save('Assets/icons/wallet_full.png')

c4 = img.crop((558, 647, 674, 763))
make_circle_crop(c4).save('Assets/icons/check_balance.png')

# Refer badge:
crop_refer = img.crop((486, 574, 690, 618))
crop_refer.save('Assets/icons/refer_badge.png')

# 3. Promo mini cards:
# Loan card:
crop_card_loan = img.crop((30, 866, 408, 936))
crop_card_loan.save('Assets/icons/promo_card_loan.png')

# Silver card:
crop_card_silver = img.crop((420, 866, 720, 936))
crop_card_silver.save('Assets/icons/promo_card_silver.png')

# 3D character loan icon (transparent):
char_box = img.crop((46, 882, 96, 942))
remove_dark_bg(char_box, 35).save('Assets/icons/promo_loan_char.png')

# 3D silver coin icon (transparent):
silver_box = img.crop((436, 886, 488, 938))
make_circle_crop(silver_box).save('Assets/icons/promo_silver_coin.png')

# 4. Recharge & Bills 4 Boxes:
# Box 1: Mobile Recharge (x: 32..178, y: 1088..1198)
b1 = img.crop((32, 1088, 178, 1198))
b1.save('Assets/icons/bill_mobile.png')

# Box 2: Tuition Fees
b2 = img.crop((202, 1088, 348, 1198))
b2.save('Assets/icons/bill_tuition.png')

# Box 3: Electricity Bill
b3 = img.crop((372, 1088, 518, 1198))
b3.save('Assets/icons/bill_electricity.png')

# Box 4: Loan Repayment
b4 = img.crop((542, 1088, 688, 1198))
b4.save('Assets/icons/bill_loan.png')

# Jio SIM card: x=424..482, y=1254..1324
jio = img.crop((424, 1254, 482, 1324))
remove_dark_bg(jio, 35).save('Assets/icons/jio_sim.png')

# 5. Bottom Navigation:
# Home: x=50..98, y=1455..1505
home_box = img.crop((50, 1455, 98, 1505))
remove_dark_bg(home_box, 30).save('Assets/icons/nav_home.png')

# Search: x=194..242, y=1455..1505
search_box = img.crop((194, 1455, 242, 1505))
remove_dark_bg(search_box, 30).save('Assets/icons/nav_search.png')

# QR FAB button: center x=361, y=1491, radius ~ 56
qr_box = img.crop((305, 1435, 417, 1547))
make_circle_crop(qr_box).save('Assets/icons/nav_qr.png')

# Alerts: x=484..532, y=1455..1505
alerts_box = img.crop((484, 1455, 532, 1505))
remove_dark_bg(alerts_box, 30).save('Assets/icons/nav_alerts.png')

# History: x=628..676, y=1455..1505
hist_box = img.crop((628, 1455, 676, 1505))
remove_dark_bg(hist_box, 30).save('Assets/icons/nav_history.png')

print("All real PhonePe assets successfully generated!")
