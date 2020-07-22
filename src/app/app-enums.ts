export enum StoreStatus {
  Created = 1,
  Pending = 2,
  Published = 3,
  Rejected = 4,
}

export enum OrderStatus {
  Pending = 1,
  Sent = 2,
  Cancelled = 3,
  Published
}

export enum VendorStatus {
  Pending = 1,
  Confirmed = 2,
  Cancelled = 3,
}

export enum NotificationTypes {
  OrderCreated = 1,
  OrderUpdated = 2,
  OrderRejected = 3
}

export enum NotificationStatus {
  Created = 1,
  Readed = 2
}