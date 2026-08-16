import sys
sys.path.insert(0, '.')
from app import db, config

res1 = db.collection(config.DOCUMENTS).update_many(
    {"title": {"$regex": "Master"}},
    {"$set": {"title": "Enterprise Security Policy"}}
)
res2 = db.collection(config.CHUNKS).update_many(
    {"documentTitle": {"$regex": "Master"}},
    {"$set": {"documentTitle": "Enterprise Security Policy"}}
)
print("Updated docs:", res1.modified_count, "chunks:", res2.modified_count)
