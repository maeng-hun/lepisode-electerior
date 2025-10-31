import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core'
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms'
import { Icon, TooltipDirective } from '@electerior/common'
import { Editor } from '@tiptap/core'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '@tiptap/extension-font-size'
import StarterKit from '@tiptap/starter-kit'
import '../../styles/ckeditor.css'
import { UploadService } from '../../services/upload.service'
import { FileDto } from '@api-client'

/**
 * @name EditorComponent
 * @description TipTap 기반 리치 텍스트 에디터 컴포넌트
 *              - h1~h3, p 노드 지원
 *              - 텍스트 정렬, 색상, 하이라이트, 이미지, 폰트 크기 적용 가능
 *              - ControlValueAccessor 구현으로 Angular Forms 연동 가능
 *              - Standalone component, 외부 입력 속성(@input)과 signal 활용
 */
@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkMenuModule, Icon, TooltipDirective],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: EditorComponent,
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements AfterViewInit, ControlValueAccessor {
  private readonly uploadService = inject(UploadService)

  currentNodeTextSize = signal<string>('h1')
  currentTextAlign = signal<string>('left')

  format = input<'html' | 'json'>('html')
  image = input<boolean>(true)
  viewer = input<boolean, string>(false, { transform: booleanAttribute })
  minHeight = input<string>('300px')
  disabled = input<boolean>(false)

  public editor?: any

  currentTextAlignIcon = computed(() => `mdi:format-align-${this.currentTextAlign()}`)

  editorRef = viewChild<ElementRef<HTMLElement>>('editorRef')

  colors = [
    '#fff',
    '#d4d4d4',
    '#737373',
    '#3f3f46',
    '#0a0a0a',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7'
  ]

  ngAfterViewInit(): void {
    this.initializeEditor()
  }

  handleCommand(commandFn: (() => any) | undefined, event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    if (commandFn) commandFn()
  }

  private initializeEditor(): void {
    if (this.editor) return

    this.editor = new Editor({
      element: this.editorRef()?.nativeElement,
      extensions: [
        StarterKit.configure({}),
        Image.configure({
          allowBase64: false,
          inline: true,
          HTMLAttributes: {
            class: 'my-editor-image'
          }
        }),
        Color,
        TextStyle,
        TextAlign.configure({
          types: ['paragraph', 'heading']
        }),
        FontSize.configure({}),
        Highlight.configure({
          multicolor: true
        })
      ],
      onTransaction: ({ editor, transaction }) => {
        this.detectTextSize(editor)
        this.detectTextAlign(editor)
        this.handleImageDelete(transaction)
      },
      onSelectionUpdate: ({ editor }) => {
        this.detectTextSize(editor)
      },
      onUpdate: ({ editor }) => this.onChange(editor.getHTML()),
      onCreate: ({ editor }) => {
        editor.view.dom.spellcheck = false
        if (this.disabled()) editor.setEditable(false)
      }
    })
  }

  // 이미지 업로드 버튼 클릭 시 호출
  selectImage(event: Event) {
    event.stopPropagation()
    event.preventDefault()

    const inputEl = document.createElement('input')
    inputEl.type = 'file'
    inputEl.accept = 'image/*'
    inputEl.click()

    inputEl.onchange = async (e: any) => {
      const file: File = e.target.files[0]
      if (!file) return

      try {
        const response: FileDto[] = await this.uploadService.upload(file)
        const url = response && response.length > 0 ? response[0].url : null

        if (!url) {
          console.error('이미지 URL을 찾을 수 없습니다.')
          return
        }

        if (this.format() === 'html') {
          this.editor.chain().focus().setImage({ src: url }).run()
        } else {
          const json = this.editor.getJSON()
          if (!json.content) json.content = []
          json.content.push({ type: 'image', attrs: { src: url } })
          this.editor.commands.setContent(json)
        }
      } catch (error) {
        console.error('이미지 업로드 실패:', error)
      }
    }
  }

  detectTextSize(editor: Editor): void {
    const node = editor.state.selection.$from.node()
    if (node.type.name === 'paragraph') this.currentNodeTextSize.set('p')
    if (node.type.name === 'heading') this.currentNodeTextSize.set(`h${node.attrs['level']}`)
  }

  detectTextAlign(editor: Editor): void {
    const currentNode = editor.state.selection.$from.node()
    this.currentTextAlign.set(currentNode.attrs['textAlign'] || 'left')
  }
  changeTextNode(size: 'h1' | 'h2' | 'h3' | 'p'): void {
    if (!this.editor) return
    if (size === 'p') this.editor.chain().focus().setParagraph().run()
    else
      this.editor
        .chain()
        .focus()
        .setHeading({ level: parseInt(size[1]) })
        .run()
  }

  handleImageDelete(transaction: any) {
    const getImages = (doc: any) => {
      const images: any[] = []
      doc.descendants((node: any) => {
        if (node.type.name === 'image') images.push(node)
        return true
      })
      return images
    }

    const currentImages = getImages(transaction.doc)
    const beforeImages = transaction.before ? getImages(transaction.before) : []

    const deletedImages = beforeImages.filter(
      (node) => !currentImages.find((curNode) => curNode.attrs.src === node.attrs.src)
    )

    deletedImages.forEach(async (node) => {
      await this.uploadService.delete(node.attrs.src)
    })
  }

  writeValue(content: any): void {
    if (!this.editor) this.initializeEditor()
    if (!this.editor) return

    if (this.format() === 'html') {
      this.editor.commands.setContent(content || '')
    } else {
      try {
        const parsed = JSON.parse(content || '{}')
        if (!parsed.content) parsed.content = []
        this.editor.commands.setContent(parsed)
      } catch (err) {
        console.error('Invalid JSON content', err)
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    this.editor?.setEditable(!isDisabled)
  }

  onChange = (value: string) => {}
  onTouched = () => {}
}
