import { useObservableState } from "observable-hooks"
import matrix from "../services/matrix"
import auth from "../services/auth"

export default function useMatrix() {
  const isReady = useObservableState(matrix.isReady$())
  const isSynced = useObservableState(matrix.isSynced$())
  const isLoaded = useObservableState(auth.isLoaded$())
  const isLoggedIn = useObservableState(auth.isLoggedIn$())

  return {
    isReady,
    isSynced,
    isLoaded,
    isLoggedIn
  }
}