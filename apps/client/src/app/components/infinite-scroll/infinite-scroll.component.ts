import { CommonModule } from '@angular/common'
import { Component, HostListener, signal, OnInit, input, TemplateRef } from '@angular/core'

@Component({
  selector: 'app-infinite-scroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infinite-scroll.component.html'
})
export default class InfiniteScrollComponent<T> implements OnInit {
  visibleCount = signal<number>(0)
  isLoading = signal<boolean>(false)

  items = input<T[]>([])
  increment = input<number>(3)
  itemTemplate = input<TemplateRef<{ $implicit: T }>>()

  get visibleItems(): T[] {
    return this.items().slice(0, this.visibleCount())
  }

  ngOnInit(): void {
    this.visibleCount.set(Math.min(this.increment(), this.items().length))
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.isLoading() || this.visibleCount() >= this.items().length) return

    const scrollPosition = window.innerHeight + window.scrollY
    const threshold = document.body.offsetHeight - 200

    if (scrollPosition >= threshold) this.loadMore()
  }

  loadMore(): void {
    if (this.visibleCount() >= this.items().length) return

    this.isLoading.set(true)
    setTimeout(() => {
      this.visibleCount.set(Math.min(this.visibleCount() + this.increment(), this.items().length))
      this.isLoading.set(false)
    }, 300)
  }
}
