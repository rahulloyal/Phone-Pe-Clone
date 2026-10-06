from PIL import Image, ImageOps, ImageDraw
import os

img = Image.open('Assets/UI Screenshots/WhatsApp Image 2026-10-04 at 16.45.58.jpeg')
w, h = img.size

os.makedirs('Assets/icons', exist_ok=True)

# Helper function to make transparent circle crop
def make_circle_crop(cropped_img):
    size = cropped_img.size
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size[0], size[1]), fill=255)
    output = Image.new('RGBA', size, (0, 0, 0, 0))
    output.paste(cropped_img.convert('RGBA'), (0, 0), mask=mask)
    return output

# 1. Top Question Mark Icon
# In screenshot: center around x=657, y=128
crop_help_box = img.crop((633, 105, 681, 153))
# Make circular transparent
crop_help_circle = make_circle_crop(crop_help_box)
crop_help_circle.save('Assets/icons/top_help.png')

# 2. Money Transfer 4 Icons
# Circle 1: To Mobile Number (center x=105, y=705, radius ~ 58)
c1 = img.crop((47, 647, 163, 763))
make_circle_crop(c1).save('Assets/icons/to_mobile.png')

# Circle 2: To Bank & Self A/c (center x=276, y=705, radius ~ 58)
c2 = img.crop((218, 647, 334, 763))
make_circle_crop(c2).save('Assets/icons/to_bank.png')

# Circle 3: PhonePe Wallet
# Wallet with Cashback badge:
# The circle is y: 647 to 763, Cashback badge is y: 626 to 656
# Let's crop full wallet with cashback badge on top!
c3_full = img.crop((385, 626, 508, 765))
# Since background outside circle & badge is black (#0e0e10), let's keep it clean
c3_full.save('Assets/icons/wallet_full.png')

# Circle 4: Check Balance (center x=616, y=705, radius ~ 58)
c4 = img.crop((558, 647, 674, 763))
make_circle_crop(c4).save('Assets/icons/check_balance.png')

# Refer badge
crop_refer = img.crop((486, 572, 690, 618))
crop_refer.save('Assets/icons/refer_badge.png')

# 3. Promo mini cards:
# Let's crop individual illustrations so they can flex-fit or crop the cards
# Illustration 1 (person with money bag): x=44..95, y=872..932
crop_loan_ill = img.crop((42, 870, 95, 932))
# Convert black background to transparent
loan_rgba = crop_loan_ill.convert('RGBA')
datas = loan_rgba.getdata()
new_data = []
for item in datas:
    # if dark background
    if item[0] < 30 and item[1] < 30 and item[2] < 30:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append(item)
loan_rgba.putdata(new_data)
loan_rgba.save('Assets/icons/promo_loan_char.png')

# Illustration 2 (silver coin): x=434..488, y=870..926
crop_silver_ill = img.crop((434, 870, 488, 926))
silver_rgba = crop_silver_ill.convert('RGBA')
datas = silver_rgba.getdata()
new_data = []
for item in datas:
    if item[0] < 30 and item[1] < 30 and item[2] < 30:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append(item)
silver_rgba.putdata(new_data)
silver_rgba.save('Assets/icons/promo_silver_coin.png')

# Whole Promo Cards:
crop_card_loan = img.crop((30, 866, 408, 936))
crop_card_loan.save('Assets/icons/promo_card_loan.png')

crop_card_silver = img.crop((420, 866, 720, 936))
crop_card_silver.save('Assets/icons/promo_card_silver.png')

# 4. Recharge & Bills 4 Boxes:
# Box 1: Mobile Recharge
box1 = img.crop((32, 1044, 178, 1152))
box1.save('Assets/icons/bill_mobile.png')

# Box 2: Tuition Fees
box2 = img.crop((202, 1044, 348, 1152))
box2.save('Assets/icons/bill_tuition.png')

# Box 3: Electricity Bill
box3 = img.crop((372, 1044, 518, 1152))
box3.save('Assets/icons/bill_electricity.png')

# Box 4: Loan Repayment
box4 = img.crop((542, 1044, 688, 1152))
box4.save('Assets/icons/bill_loan.png')

# Jio SIM card graphic:
jio = img.crop((422, 1196, 484, 1266))
jio_rgba = jio.convert('RGBA')
datas = jio_rgba.getdata()
new_data = []
for item in datas:
    if item[0] < 35 and item[1] < 35 and item[2] < 35:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append(item)
jio_rgba.putdata(new_data)
jio_rgba.save('Assets/icons/jio_sim.png')

# 5. Bottom Navigation Icons:
# Home: x=48..102, y=1454..1514
crop_home = img.crop((48, 1452, 104, 1512))
crop_home.save('Assets/icons/nav_home.png')

# Search: x=192..246, y=1454..1514
crop_search = img.crop((192, 1452, 248, 1512))
crop_search.save('Assets/icons/nav_search.png')

# QR FAB button: x=303..419, y=1433..1549
crop_qr = img.crop((304, 1434, 418, 1548))
make_circle_crop(crop_qr).save('Assets/icons/nav_qr.png')

# Alerts: x=480..536, y=1454..1514
crop_alerts = img.crop((480, 1452, 536, 1512))
crop_alerts.save('Assets/icons/nav_alerts.png')

# History: x=624..680, y=1454..1514
crop_hist = img.crop((624, 1452, 680, 1512))
crop_hist.save('Assets/icons/nav_history.png')

print("All icons processed with perfection!")
