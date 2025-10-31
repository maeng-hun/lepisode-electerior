abstract class Animal {
  constructor(private name: string) {}

  abstract run(): any
  abstract jump(): any
  abstract eat(): any
}

class 토끼 extends Animal {
  override run() {
    return '깡총깡총'
  }
  override jump() {
    return '깡총깡총'
  }
  override eat() {
    return '사각사각'
  }
}
