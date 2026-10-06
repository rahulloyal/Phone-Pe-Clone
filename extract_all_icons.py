from PIL import Image
import os

img = Image.open('Assets/UI Screenshots/WhatsApp Image 2026-10-04 at 16.45.58.jpeg')
w, h = img.size

os.makedirs('Assets/icons', exist_ok=True)

# 1. Top Question Mark icon (on purple background, let's crop it cleanly)
# Looking at test_gold.png: y is around 80-160, x is around 630-685
crop_help = img.crop((633, 105, 680, 152))
crop_help.save('Assets/icons/top_help.png')

# 2. Money Transfer 4 icons:
# In test_transfer (y_offset=540):
# Icon 1 (To Mobile): x ~ 45 to 165, y ~ 645 to 765
# Icon 2 (To Bank): x ~ 215 to 335, y ~ 645 to 765
# Icon 3 (Wallet): x ~ 385 to 505, y ~ 645 to 765 (Cashback is y ~ 630 to 660)
# Icon 4 (Check Balance): x ~ 555 to 675, y ~ 645 to 765

# Let's crop with precision
crop_to_mobile = img.crop((48, 648, 163, 763))
crop_to_mobile.save('Assets/icons/to_mobile.png')

crop_to_bank = img.crop((219, 648, 334, 763))
crop_to_bank.save('Assets/icons/to_bank.png')

crop_wallet = img.crop((389, 648, 504, 763))
crop_wallet.save('Assets/icons/wallet.png')

crop_wallet_with_badge = img.crop((389, 626, 504, 763))
crop_wallet_with_badge.save('Assets/icons/wallet_full.png')

crop_check_balance = img.crop((559, 648, 674, 763))
crop_check_balance.save('Assets/icons/check_balance.png')

# Refer badge: x ~ 485 to 690, y ~ 570 to 618
crop_refer = img.crop((485, 570, 690, 620))
crop_refer.save('Assets/icons/refer_badge.png')

# 3. Promo mini cards:
# In test_promo (y_offset=840):
# Card 1 icon (loan 50% character): x ~ 45 to 90, y ~ 870 to 925
crop_loan_icon = img.crop((44, 870, 92, 925))
crop_loan_icon.save('Assets/icons/promo_loan_char.png')

# Card 2 icon (silver coin): x ~ 430 to 488, y ~ 868 to 926
crop_silver_icon = img.crop((435, 870, 488, 925))
crop_silver_icon.save('Assets/icons/promo_silver_coin.png')

# Full Card 1: x ~ 30 to 405, y ~ 855 to 940
crop_promo_card1 = img.crop((30, 855, 408, 940))
crop_promo_card1.save('Assets/icons/promo_card_loan.png')

# Full Card 2: x ~ 420 to 720, y ~ 855 to 940
crop_promo_card2 = img.crop((420, 855, 720, 940))
crop_promo_card2.save('Assets/icons/promo_card_silver.png')

# 4. Recharge & Bills icons:
# In test_recharge (y_offset=980):
# 4 boxes: y ~ 1038 to 1152
# Box 1 (Mobile recharge): x ~ 32 to 180
# Box 2 (Tuition fees): x ~ 202 to 350
# Box 3 (Electricity bill): x ~ 372 to 520
# Box 4 (Loan repayment): x ~ 542 to 690
crop_bill_mobile = img.crop((32, 1038, 178, 1152))
crop_bill_mobile.save('Assets/icons/bill_mobile.png')

crop_bill_tuition = img.crop((202, 1038, 348, 1152))
crop_bill_tuition.save('Assets/icons/bill_tuition.png')

crop_bill_elec = img.crop((372, 1038, 518, 1152))
crop_bill_elec.save('Assets/icons/bill_electricity.png')

crop_bill_loan = img.crop((542, 1038, 688, 1152))
crop_bill_loan.save('Assets/icons/bill_loan.png')

# Inner graphics inside the boxes (just the 3D illustrations):
crop_ill_mobile = img.crop((80, 1052, 130, 1138))
crop_ill_mobile.save('Assets/icons/ill_mobile.png')

crop_ill_tuition = img.crop((230, 1050, 320, 1138))
crop_ill_tuition.save('Assets/icons/ill_tuition.png')

crop_ill_elec = img.crop((416, 1050, 474, 1138))
crop_ill_elec.save('Assets/icons/ill_electricity.png')

crop_ill_loan = img.crop((575, 1050, 655, 1138))
crop_ill_loan.save('Assets/icons/ill_loan.png')

# Jio SIM: x ~ 422 to 482, y ~ 1188 to 1272
# Or inside the pill:
crop_jio_sim = img.crop((422, 1195, 482, 1265))
crop_jio_sim.save('Assets/icons/jio_sim.png')

# 5. Bottom Navigation icons:
# y ~ 1445 to 1570
# Home: x ~ 45 to 105, y ~ 1465 to 1520
# Search: x ~ 190 to 245, y ~ 1465 to 1520
# QR FAB button: x ~ 305 to 415, y ~ 1435 to 1545
# Alerts: x ~ 480 to 535, y ~ 1465 to 1520
# History: x ~ 625 to 680, y ~ 1465 to 1520
crop_nav_home = img.crop((48, 1465, 102, 1515))
crop_nav_home.save('Assets/icons/nav_home.png')

crop_nav_search = img.crop((192, 1465, 246, 1515))
crop_nav_search.save('Assets/icons/nav_search.png')

crop_nav_qr = img.crop((305, 1435, 417, 1547))
crop_nav_qr.save('Assets/icons/nav_qr.png')

crop_nav_alerts = img.crop((480, 1465, 534, 1515))
crop_nav_alerts.save('Assets/icons/nav_alerts.png')

crop_nav_history = img.crop((624, 1465, 678, 1515))
crop_nav_history.save('Assets/icons/nav_history.png')

print("All icons successfully cropped and saved.")
