import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
    credentialsForm: FormGroup;
    submitted: boolean;

    constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

    get f() { return this.credentialsForm.controls; }

    ngOnInit() {
        this.credentialsForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }
    register() {
        this.submitted = true;
        if(this.credentialsForm.valid) {
            this.authService.register(this.credentialsForm.value).subscribe(res => {
                // Call Login to automatically login the new user
                this.authService.login(this.credentialsForm.value).subscribe();
            });
        }
    }


}
