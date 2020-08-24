import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from '../cs-services/app.service';

@Pipe({
  name: 'sectorName'
})
export class SectorNamePipe implements PipeTransform {
  constructor(private appService: AppService) { }

  transform(idSector: string): string {
    let sectorName: string ='';
    // this.appService._sectors.forEach(sector => {
    //   if (sector.id == idSector) {
    //     sectorName = sector.name;
    //   }
    // });

    return sectorName;
  }
}
