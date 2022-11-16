import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { visibility, flyInOut, expand } from '../animations/app.animation';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: { 
    '[@flyInOut': 'true',
    'style': 'display:block;'
  },
  animations: [
    flyInOut(),
    visibility(),
    expand()
  ]
 
})
export class DishdetailComponent implements OnInit {



    @ViewChild('cform')  commentFormDirective: any;

    dish!: Dish;
    errMess!: string;
    dishIds!: string[];
    prev!: string;
    next!: string;   
   comment!: Comment;
   dishcopy!: Dish;
   visibility!: 'shown';
    

    formErrors = {
      'author': '',
      'comment': ''      
    };

    validationMessages = {
      'author': {
        'required': 'Name  is required.',
        'minlength': 'Name  must be at least 2 characters long.',
        'maxlength': 'Name cannot be more than 25 characters long.'
      },
      'comment': {
        'required': 'Comment is required.',
        'minlength': 'Comment must be at least 2 characters long.',
        'maxlength': 'Comment cannot be more than 25 characters long.'  
      }

    };  

    commentForm!: FormGroup;

  
  constructor (private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL)

     {  }
   

  ngOnInit() { 

     this.createForm();

     this.dishservice.getDishIds().subscribe((dishIds) => this.dishIds = dishIds);
     this.route.params
     .pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(params['id']); }))
        .subscribe(dish  => {this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess );
        
        }
      




  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index +  1) % this.dishIds.length];
  }

  goBack(): void{
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: ['5'] ,
      comment: ['', Validators.required, Validators.minLength(2), Validators.maxLength(25)],
   
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }   
  
  onSubmit() {
      
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
    console.log(this.comment);
    this.dishcopy.comments.push(this.comment);     
    this.dishService.putDish(this.dishcopy)
    .subscribe((dish: Dish) => {
      this.dish = dish; this.dishcopy = dish;
    },
    ( errMess: any) => { this.dish = null; this.dishcopy = null; this.errMess = <any>errMess; });
  this.commentFormDirective.resetForm();
  this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });

    this.commentFormDirective.resetForm();
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
      
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
       
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              
                      
              
            }
          }
        }
      }
    }
  }
}
