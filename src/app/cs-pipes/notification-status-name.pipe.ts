import { Pipe, PipeTransform } from '@angular/core';
import { NotificationStatus } from '../app-enums';

@Pipe({
  name: 'notificationStatusName'
})
export class NotificationStatusNamePipe implements PipeTransform {
  transform(idStatus: number): any {
    switch (idStatus) {
      case NotificationStatus.Created: {
        return 'Creada'
      }
      case NotificationStatus.Readed: {
        return 'Leída'
      }
    }
  }
}
