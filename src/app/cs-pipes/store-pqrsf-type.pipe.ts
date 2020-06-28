import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storePqrsfType'
})
export class StorePqrsfTypePipe implements PipeTransform {

  transform(idStorePqrsfType: string): any {
    switch (idStorePqrsfType) {
      case "1": {
        return 'Petición'
      }
      case "2": {
        return 'Queja'
      }
      case "3": {
        return 'Reclamo'
      }
      case "4": {
        return 'Sugerencia'
      }
      case "5": {
        return 'Felicitación'
      }
    }
  }

}
