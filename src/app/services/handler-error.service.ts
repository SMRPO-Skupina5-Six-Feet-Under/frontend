import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleErrorService {

  handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
      this.toastr.error('An error occurred: ' + error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(`Server error: ${error.status}, body was: `, error.error.detail);
      this.toastr.error(error.error?.detail, `Backend error: ${error.status}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(() => of(null)/* new Error('Something bad happened; please try again later.') */);
  }

  constructor(
    private toastr: ToastrService,
  ) { }
}
