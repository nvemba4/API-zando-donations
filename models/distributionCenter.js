const admin = require("firebase-admin");
const db = admin.firestore();

class DistributionCenter {
  constructor({
    centerId,
    name,
    address,
    capacity,
    currentStock = 0,
    manager,
    contact,
    operatingHours,
    needs,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.centerId = centerId;
    this.name = name;
    this.address = address;
    this.capacity = capacity;
    this.currentStock = currentStock;
    this.manager = manager;
    this.contact = contact;
    this.operatingHours = operatingHours;
    this.needs = needs;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static collection = db.collection('distribution_centers');

  toFirestore() {
    return {
      name: this.name,
      address: this.address,
      capacity: this.capacity,
      currentStock: this.currentStock,
      manager: this.manager,
      contact: this.contact,
      operatingHours: this.operatingHours,
      needs: [
        ...this.needs
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  static fromFirestore(snapshot,id) {
    const data = snapshot.data();
    return new DistributionCenter({
      centerId: id,
      ...data,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }
}

module.exports = DistributionCenter;