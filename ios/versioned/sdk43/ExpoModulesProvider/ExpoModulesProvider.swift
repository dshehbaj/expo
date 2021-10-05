/**
 * Automatically generated by expo-modules-autolinking.
 *
 * This autogenerated class provides a list of classes of native Expo modules,
 * but only these that are written in Swift and use the new API for creating Expo modules.
 */

import ABI43_0_0ExpoModulesCore
import ABI43_0_0EXCellular
import ABI43_0_0EXHaptics
import ABI43_0_0EXLinearGradient
import ABI43_0_0EXTrackingTransparency

@objc(ABI43_0_0ExpoModulesProvider)
public class ExpoModulesProvider: ModulesProvider {
  public override func getModuleClasses() -> [AnyModule.Type] {
    return [
      CellularModule.self,
      HapticsModule.self,
      LinearGradientModule.self,
      TrackingTransparencyModule.self
    ]
  }
}
