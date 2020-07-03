import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../app-enums';

@Pipe({
  name: 'orderStatusName'
})
export class OrderStatusNamePipe implements PipeTransform {
  transform(idStatus: number): any {
    switch (idStatus) {
      case OrderStatus.Pending: {
        return 'Pendiente'
      }
      case OrderStatus.Sent: {
        return 'Enviado'
      }
      case OrderStatus.Cancelled: {
        return 'Rechazado'
      }
    }
  }
}
