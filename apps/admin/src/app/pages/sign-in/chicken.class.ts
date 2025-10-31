abstract class 치킨 {
  constructor(
    private name: string,
    private price: number
  ) {}

  abstract getSauce(): any
}

class 양념치킨 extends 치킨 {
  override getSauce() {
    return ''
  }
}
class 간장치킨 extends 치킨 {
  override getSauce() {
    return ''
  }
}
class 나폴리투움바파스타치킨 extends 치킨 {
  override getSauce() {
    return ''
  }
}

const order양념치킨 = () => {
  const _양념치킨 = new 양념치킨('양념치킨', 25000)
  const sauce = _양념치킨.getSauce()
}
