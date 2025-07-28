import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';  


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(public authService: AuthService, private router: Router) {}
  userRole: string | null = null;
  ngOnInit() {
    this.userRole = localStorage.getItem('role');
    console.log('Rol del usuario en Home:', this.userRole);
    
   
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  
}
