#!/usr/bin/env node

console.log("Node.js Memory Configuration:");
console.log("============================");
console.log(`NODE_OPTIONS: ${process.env.NODE_OPTIONS || "Not set"}`);
console.log(
  `Max Old Space Size: ${process.execArgv.find((arg) => arg.includes("max-old-space-size")) || "Default"}`,
);
console.log(
  `Available Memory: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
);
console.log(
  `Used Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
);
console.log(
  `RSS Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
);
console.log(
  `External Memory: ${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
);

// Check if 24GB limit is properly set
const maxOldSpaceArg = process.execArgv.find((arg) =>
  arg.includes("max-old-space-size"),
);
if (maxOldSpaceArg) {
  const memoryLimit = parseInt(maxOldSpaceArg.split("=")[1]);
  console.log(
    `\nMemory Limit: ${memoryLimit}MB (${Math.round((memoryLimit / 1024) * 100) / 100}GB)`,
  );

  if (memoryLimit >= 24576) {
    console.log("✅ 24GB memory limit is properly configured");
  } else {
    console.log("⚠️  Memory limit is less than 24GB");
  }
} else {
  console.log("\n⚠️  No explicit memory limit set, using Node.js default");
}
