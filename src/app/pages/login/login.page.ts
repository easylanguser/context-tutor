import { Component, ViewEncapsulation } from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-provider';

import { UserOptions } from '../../interfaces/user';
import {AuthService} from "../../services/auth/auth.service";



@Component({
    selector: 'page-login',
    templateUrl: 'login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    credentialsForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

    ngOnInit() {
        this.credentialsForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit() {
        this.authService.login(this.credentialsForm.value).subscribe();
    }

    register() {
        this.authService.register(this.credentialsForm.value).subscribe(res => {
            // Call Login to automatically login the new user
            this.authService.login(this.credentialsForm.value).subscribe();
        });
    }
}
