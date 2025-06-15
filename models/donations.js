class Donation {
  constructor({
    donorId,
    type,
    status = 'registered',
    items = [],
    schedule = null,
    impactReport = null,
    name = '',
    quantity = 0,
    condition = '',
    createdAt = new Date().toISOString()
  }) {
    this.donationId = ''; // Será gerado pelo Firestore
    this.donorId = donorId;
    this.type = type;
    this.status = status;
    this.items = items;
    this.schedule = schedule;
    this.impactReport = impactReport;
    this.name = name;
    this.quantity = quantity;
    this.condition = condition;
    this.createdAt = createdAt;
  }

  toFirestore() {
    return {
      donorId: this.donorId,
      type: this.type,
      status: this.status,
      items: this.items,
      schedule: this.schedule,
      impactReport: this.impactReport,
      name: this.name,
      quantity: this.quantity,
      condition: this.condition,
      createdAt: this.createdAt
    };
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Donation({
      donationId: doc.id,
      donorId: data.donorId,
      type: data.type,
      status: data.status,
      items: data.items,
      schedule: data.schedule,
      impactReport: data.impactReport,
      name: data.name,
      quantity: data.quantity,
      condition: data.condition,
      createdAt: data.createdAt.toDate()
    });
  }
}

module.exports = Donation;