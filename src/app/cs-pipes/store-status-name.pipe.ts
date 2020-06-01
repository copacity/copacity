import { Pipe, PipeTransform } from '@angular/core';
import { StoreStatus } from '../app-enums';

@Pipe({
  name: 'storeStatusName'
})
export class StoreStatusNamePipe implements PipeTransform {
  transform(idStatus: number): any {
    switch (idStatus) {
      case StoreStatus.Created: {
        return 'Creada'
      }
      case StoreStatus.Pending: {
        return 'Pendiente de publicacion'
      }
      case StoreStatus.Published: {
        return 'Publicada'
      }
      case StoreStatus.Rejected: {
        return 'Rechazada'
      }
    }
  }
}
