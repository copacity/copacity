import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from '../cs-services/app.service';

@Pipe({
  name: 'sectorName'
})
export class SectorNamePipe implements PipeTransform {
  constructor(private appService: AppService) { }

  transform(idCategory: string): string {
    let sectorName: string ='';
    this.appService._categories.forEach(category => {
      if (category.id == idCategory) {
        sectorName = category.name;
      }
    });

    return sectorName;
  }
}
