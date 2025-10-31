import { trigger, transition, style, animate } from '@angular/animations'

export const fadeUp = trigger('fadeUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))])
])

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [style({ opacity: 0 }), animate('500ms ease-out', style({ opacity: 1 }))]),
  transition(':leave', [animate('500ms ease-in', style({ opacity: 0 }))])
])

export const slideLeft = trigger('slideLeft', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(20px)' }),
    animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))])
])

export const slideRight = trigger('slideRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-20px)' }),
    animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [animate('500ms ease-in', style({ opacity: 0, transform: 'translateX(-20px)' }))])
])
