import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateDecimals' })
export class TruncateDecimalsPipe implements PipeTransform {
  transform(value: number, decimals: number = 2): string {
    if (value === null || isNaN(value)) return '';
    
    const factor = Math.pow(10, decimals);
    const truncated = Math.floor(value * factor) / factor;
    
    return truncated.toFixed(decimals);
  }
}