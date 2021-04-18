import { Pipe, PipeTransform } from '@angular/core';
import { AppService } from '../cs-services/app.service';

@Pipe({
  name: 'storeCategoryName'
})
export class StoreCategoryNamePipe implements PipeTransform {
  constructor(private appService: AppService) { }

  transform(idStoreCategory: string): string {
    let storeCategoryName: string ='';
    // this.appService._storeCategories.forEach(storeCategory => {
    //   if (storeCategory.id == idStoreCategory) {
    //     storeCategoryName = storeCategory.name;
    //   }
    // });

    return storeCategoryName;
  }
}
