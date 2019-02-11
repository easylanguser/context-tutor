import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";
import {Router} from "@angular/router";
import {UserService} from "../../services/user/user-service";

@Component({
  selector: 'app-forget',
  templateUrl: './forget.page.html',
  styleUrls: ['./forget.page.scss'],
})
export class ForgetPage implements OnInit {

    credentialsForm: FormGroup;
    submitted: boolean;

    constructor(private formBuilder: FormBuilder, private UserService: UserService,
                private router: Router) { }

    get f() { return this.credentialsForm.controls; }

    ngOnInit() {
        this.credentialsForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        this.submitted = true;
        if(this.credentialsForm.valid){
            this.UserService.sendPasswordToEmail(this.credentialsForm.value).subscribe()
        }
    }

    toSignUp() {
        this.router.navigate(['forget']);
    }

}
