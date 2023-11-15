export function shouldUpdateComponent(n1, n2) {
  const { props :preProps } = n1
  const { props: nextProps } = n2
  for (const key in preProps) {
    if(preProps[key] !== nextProps[key]){
      return true
    }
  }
  return false
}
