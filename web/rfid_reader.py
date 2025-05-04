# rfid_reader.py

from pirc522 import RFID
import time

reader = RFID()
try:
    print("Place RFID card near the reader...")
    while True:
        reader.wait_for_tag()
        (error, tag_type) = reader.request()
        if not error:
            (error, uid) = reader.anticoll()
            if not error:
                tag_id = ':'.join([str(x) for x in uid])
                print(f"Card detected! UID: {tag_id}")
                time.sleep(1.5)  # avoid double-read
except KeyboardInterrupt:
    print("\nStopping RFID reader...")
finally:
    reader.cleanup()
