export const useShiftArray = <T>() => {
  const shiftArray: T[] = []

  const push = (value: T) => {
    shiftArray.push(value)

    if (shiftArray.length > 10) {
      shiftArray.shift()
    }
  }

  return { shiftArray, push }
}
