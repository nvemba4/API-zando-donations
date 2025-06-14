const admin = require("firebase-admin");
const db = admin.firestore();

class Store {
  constructor(data) {
    this.name = data.name;
    this.address = data.address || {};
    this.category = data.category;
    this.contact = data.contact || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = new Date().toISOString();
  }

  static collection = db.collection('stores');


  toFirestore() {
    return { 
    name: this.name,      
    address: this.address,   
    category: this.category,  
    contact: this.contact,  
    isActive: this.isActive,  
    createdAt: this.createdAt 

    };
  }

   static fromFirestore(snapshot,id) {
    const data = snapshot.data();
    return new DistributionCenter({
      storeId: id,
      ...data,
      createdAt: data.createdAt,

    });
  }

}

module.exports = Store;