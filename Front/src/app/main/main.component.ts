import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  address: string;

  constructor() { }

  ngOnInit() {    
    this.address = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73";
  }

  requestEth() {
      console.log(this.address);
      window.open('http://localhost:3000/requestEth/' + this.address , "_blank");
  }    

  generateDoc() {
      console.log(this.address);
      window.open('http://localhost:3000/generatepdf/' + this.address , "_blank");
  }  

  signDeclaration() {
    alert("Implementar")
  }

  loginUnico() {
    window.open('http://localhost:3000/loginunico/', "_blank");
  }

  loginUnicoRetorno() {
    window.open('http://localhost:3000/loginunico/autorizado/' + this.address, "_blank");
  }  

}
