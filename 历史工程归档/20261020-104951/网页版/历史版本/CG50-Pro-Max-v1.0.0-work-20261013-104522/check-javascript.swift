
import Foundation
import JavaScriptCore
import Darwin
let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
let rows = try JSONSerialization.jsonObject(with: data) as! [[String:String]]
let context = JSContext()!
var failures = 0
for row in rows {
    context.exception = nil
    let encoded = try JSONSerialization.data(
        withJSONObject: row["source"]!, options: [.fragmentsAllowed]
    )
    let literal = String(data: encoded, encoding: .utf8)!
    context.evaluateScript("new Function(" + literal + ");")
    if let exception = context.exception {
        print(row["name"]! + ": " + exception.toString())
        failures += 1
    }
}
if failures > 0 { exit(1) }
print("网页脚本语法检查通过。")
