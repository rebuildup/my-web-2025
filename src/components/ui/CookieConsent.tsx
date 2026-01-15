/**
 * Cookie Consent Component
 * Interactive terminal-style cookie consent with command input and easter eggs
 */

"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAnalytics } from "@/components/providers/AnalyticsProvider";

interface CookieConsentProps {
	className?: string;
}

const normalizeCommandInput = (input: string) => {
	const trimmed = input.normalize("NFKC").trim();
	if (!trimmed) return "";

	// Strip common prompt prefixes and trailing punctuation users often type.
	const withoutPrompt = trimmed.replace(/^[>$#]+\s*/u, "");
	return withoutPrompt
		.toLowerCase()
		.replace(/\s+/gu, " ")
		.replace(/[.!?….、！？]+$/gu, "")
		.trim();
};

const ACCEPT_TOKENS = new Set<string>([
	"y",
	"yes",
	"yeah",
	"yep",
	"yup",
	"aye",
	"affirmative",
	"ok",
	"okay",
	"okey",
	"okie",
	"okidoki",
	"okie-dokie",
	"k",
	"sure",
	"surething",
	"alright",
	"fine",
	"agreed",
	"agree",
	"allow",
	"accept",
	"acceptall",
	"accept-all",
	"consent",
	"approve",
	"enable",
	"on",
	"true",
	"1",
	"optin",
	"opt-in",
]);

const REJECT_TOKENS = new Set<string>([
	"n",
	"no",
	"nope",
	"nah",
	"deny",
	"decline",
	"reject",
	"rejectall",
	"reject-all",
	"disallow",
	"block",
	"disable",
	"off",
	"false",
	"0",
	"optout",
	"opt-out",
]);

const SAVE_TOKENS = new Set<string>([
	"save",
	"apply",
	"done",
	"confirm",
	"continue",
	"next",
	"決定",
	"保存",
	"適用",
	"完了",
]);

const EXIT_TOKENS = new Set<string>([
	"exit",
	"quit",
	"q",
	"cancel",
	"close",
	"dismiss",
	"skip",
	"later",
	"not now",
	"notnow",
	"not-now",
	"あとで",
	"後で",
	"今はしない",
	"今はいい",
	"キャンセル",
	"閉じる",
	"スキップ",
]);

const ESSENTIAL_ONLY_TOKENS = new Set<string>([
	"essential",
	"necessary",
	"required",
	"minimum",
	"minimal",
	"only-essential",
	"only-necessary",
	"必須",
	"必要",
	"最小",
	"最低限",
	"必須のみ",
	"必要のみ",
]);

const ANALYTICS_KEYWORDS = [
	"analytics",
	"ga",
	"googleanalytics",
	"google-analytics",
	"tracking",
	"track",
	"metrics",
	"measurement",
	"performance",
	"分析",
	"解析",
	"計測",
	"トラッキング",
	"アナリティクス",
] as const;

const ENABLE_KEYWORDS = [
	"on",
	"enable",
	"enabled",
	"allow",
	"accept",
	"yes",
	"true",
	"1",
	"有効",
	"オン",
	"許可",
	"同意",
	"はい",
] as const;

const DISABLE_KEYWORDS = [
	"off",
	"disable",
	"disabled",
	"deny",
	"reject",
	"no",
	"false",
	"0",
	"無効",
	"オフ",
	"拒否",
	"いいえ",
] as const;

export function CookieConsent({ className = "" }: CookieConsentProps) {
	const [showBanner, setShowBanner] = useState(false);
	const [lastOutput, setLastOutput] = useState<string | React.ReactNode>("");
	const [inputValue, setInputValue] = useState("");
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [commandHistoryList, setCommandHistoryList] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const { consentGiven, setConsent } = useAnalytics();

	useEffect(() => {
		// Don't show banner in test environment
		if (
			process.env.NODE_ENV === "test" ||
			process.env.PLAYWRIGHT_TEST === "true"
		) {
			return;
		}

		// Show banner if consent hasn't been given or denied
		const savedConsent = localStorage.getItem("analytics-consent");
		if (savedConsent === null) {
			setShowBanner(true);
		}
	}, []);

	useEffect(() => {
		if (showBanner && inputRef.current) {
			inputRef.current.focus();
		}
	}, [showBanner]);

	const handleAcceptAll = () => {
		setConsent(true);
		setLastOutput("✓ All cookies accepted.");
		setTimeout(() => {
			setLastOutput("Saving preferences...");
			setTimeout(() => {
				setLastOutput("Shutting down terminal...");
				setTimeout(() => setShowBanner(false), 500);
			}, 500);
		}, 500);
	};

	const handleRejectAll = () => {
		setConsent(false);
		setLastOutput("✗ All cookies rejected.");
		setTimeout(() => {
			setLastOutput("Saving preferences...");
			setTimeout(() => {
				setLastOutput("Shutting down terminal...");
				setTimeout(() => setShowBanner(false), 500);
			}, 500);
		}, 500);
	};

	const executeCommand = (cmd: string) => {
		const fullCmd = cmd.trim();
		const normalizedCmd = normalizeCommandInput(cmd);
		const lowerCmd = normalizedCmd;
		const parts = normalizedCmd ? normalizedCmd.split(" ") : [];
		const command = parts[0] ?? "";
		const args = parts.slice(1);

		// Add to command history
		if (fullCmd) {
			setCommandHistoryList((prev) => [...prev, fullCmd]);
		}

		// Execute command and set last output
		let output: string | React.ReactNode = "";

		if (!normalizedCmd) {
			setLastOutput("");
			setInputValue("");
			setHistoryIndex(-1);
			return;
		}

		const closeWithSave = (analyticsEnabled: boolean, message: string) => {
			setConsent(analyticsEnabled);
			setLastOutput(message);
			setTimeout(() => {
				setLastOutput("Saving preferences...");
				setTimeout(() => {
					setLastOutput("Shutting down terminal...");
					setTimeout(() => setShowBanner(false), 500);
				}, 500);
			}, 500);
		};

		const closeWithoutSaving = () => {
			setLastOutput("Exiting without saving preferences...");
			setTimeout(() => {
				setLastOutput("Goodbye!");
				setTimeout(() => setShowBanner(false), 500);
			}, 500);
		};

		// Analytics intent (configure without closing)
		const normalizedNoSpaces = normalizedCmd.replace(/\s+/gu, "");
		const mentionsAnalytics = ANALYTICS_KEYWORDS.some(
			(k) => normalizedCmd.includes(k) || normalizedNoSpaces.includes(k),
		);
		if (mentionsAnalytics) {
			const wantsEnable = ENABLE_KEYWORDS.some((k) =>
				normalizedCmd.includes(k),
			);
			const wantsDisable = DISABLE_KEYWORDS.some((k) =>
				normalizedCmd.includes(k),
			);
			if (wantsEnable && !wantsDisable) {
				setConsent(true);
				setLastOutput("Analytics cookies enabled.");
				setInputValue("");
				setHistoryIndex(-1);
				return;
			}
			if (wantsDisable && !wantsEnable) {
				setConsent(false);
				setLastOutput("Analytics cookies disabled.");
				setInputValue("");
				setHistoryIndex(-1);
				return;
			}
		}

		// Save / exit shortcuts
		if (SAVE_TOKENS.has(command) || SAVE_TOKENS.has(normalizedCmd)) {
			closeWithSave(
				consentGiven,
				`✓ Preferences saved. Analytics cookies ${
					consentGiven ? "enabled" : "disabled"
				}.`,
			);
			setInputValue("");
			setHistoryIndex(-1);
			return;
		}
		if (EXIT_TOKENS.has(command) || EXIT_TOKENS.has(normalizedCmd)) {
			closeWithoutSaving();
			setInputValue("");
			setHistoryIndex(-1);
			return;
		}

		// Essential-only shortcuts (equivalent to rejecting analytics cookies)
		const isEssentialOnly =
			ESSENTIAL_ONLY_TOKENS.has(command) ||
			ESSENTIAL_ONLY_TOKENS.has(normalizedCmd) ||
			/^(essential|necessary|required)\s+only\b/u.test(normalizedCmd) ||
			/^(only)\s+(essential|necessary|required)\b/u.test(normalizedCmd) ||
			/^(minimal|minimum)\s+(cookies)?\b/u.test(normalizedCmd) ||
			normalizedCmd.includes("必須のみ") ||
			normalizedCmd.includes("必要のみ");
		if (isEssentialOnly) {
			closeWithSave(false, "✓ Only essential cookies enabled.");
			setInputValue("");
			setHistoryIndex(-1);
			return;
		}

		// Cookie consent responses (Accept variations)
		if (
			ACCEPT_TOKENS.has(command) ||
			normalizedCmd === "はい" ||
			normalizedCmd === "うん" ||
			normalizedCmd === "ええ" ||
			normalizedCmd === "いいよ" ||
			normalizedCmd === "okです" ||
			normalizedCmd === "オーケー" ||
			normalizedCmd.startsWith("同意") ||
			normalizedCmd.startsWith("承諾") ||
			normalizedCmd.startsWith("許可") ||
			normalizedCmd.startsWith("承認") ||
			normalizedCmd.startsWith("受け入れ") ||
			/^(accept|allow|agree|consent|approve|enable)\b/u.test(normalizedCmd) ||
			/^i (agree|accept)\b/u.test(normalizedCmd) ||
			/^(accept|allow)\s+(all|everything|cookies)\b/u.test(normalizedCmd) ||
			/^(ok|okay)\s+(go|sure|fine)\b/u.test(normalizedCmd)
		) {
			output = "✓ All cookies accepted.";
			handleAcceptAll();
			setInputValue("");
			setHistoryIndex(-1);
			return;
		}

		// Cookie consent responses (Reject variations)
		if (
			REJECT_TOKENS.has(command) ||
			normalizedCmd === "いいえ" ||
			normalizedCmd === "いや" ||
			normalizedCmd === "だめ" ||
			normalizedCmd === "やだ" ||
			normalizedCmd.startsWith("拒否") ||
			normalizedCmd.startsWith("拒絶") ||
			normalizedCmd.startsWith("同意しない") ||
			normalizedCmd.startsWith("許可しない") ||
			normalizedCmd.startsWith("拒否する") ||
			/^(reject|deny|decline|disable|block)\b/u.test(normalizedCmd) ||
			/^i (do not|don't) (agree|accept)\b/u.test(normalizedCmd) ||
			/^(reject|deny|decline)\s+(all|everything|cookies)\b/u.test(
				normalizedCmd,
			) ||
			/^(no)\s+(thanks|thank you)\b/u.test(normalizedCmd)
		) {
			output = "✗ All cookies rejected.";
			handleRejectAll();
			setInputValue("");
			setHistoryIndex(-1);
			return;
		}

		switch (command) {
			case "help":
			case "h":
			case "?":
			case "--help":
			case "-h":
				output = `Available commands:
  help, h                 - Show this help message
  accept / reject         - Save and close (all vs none)
  essential only          - Save and close (required only)
  customize, settings     - Show detailed cookie configuration
  toggle analytics        - Toggle analytics cookies
  analytics on/off        - Enable/disable analytics (no close)
  status                  - Show current preferences
  ls, dir                 - List cookie categories
  cat|type cookie-config.json - Show cookie configuration
  clear, cls              - Clear terminal
  save                    - Save current preferences and close
  exit, cancel            - Close without saving`;
				break;

			case "accept":
			case "accept_all":
			case "allow_all":
			case "enable_all":
				output = "✓ All cookies accepted.";
				handleAcceptAll();
				setInputValue("");
				setHistoryIndex(-1);
				return;

			case "reject":
			case "reject_all":
			case "deny_all":
			case "disable_all":
				output = "✗ All cookies rejected.";
				handleRejectAll();
				setInputValue("");
				setHistoryIndex(-1);
				return;

			case "customize":
			case "config":
			case "settings":
			case "setting":
			case "prefs":
			case "preferences":
			case "options":
			case "configure":
			case "configuration":
				output = `Cookie Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[REQUIRED] essential_cookies
  Status: always_active
  Description: Required for basic website functionality
  Cannot be disabled

[OPTIONAL] analytics_cookies
  Status: ${consentGiven ? "enabled" : "disabled"}
  Description: Help us understand visitor behavior
  Toggle: Use 'toggle analytics' command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
				break;

			case "ls":
				if (lowerCmd.includes(" -la") || lowerCmd.includes(" -a")) {
					output = `total 8
drwxr-xr-x  2 user user 4096 Dec 13 12:00 .
drwxr-xr-x  3 user user 4096 Dec 13 12:00 ..
-rw-r--r--  1 user user  256 Dec 13 12:00 essential_cookies
-rw-r--r--  1 user user  512 Dec 13 12:00 analytics_cookies`;
				} else {
					output = `cookie-categories/
├── essential_cookies/    [REQUIRED]
│   └── session_management
└── analytics_cookies/    [OPTIONAL]
    ├── google_analytics
    └── performance_metrics`;
				}
				break;

			case "dir":
				output = ` Volume in drive C has no label.
 Volume Serial Number is 1234-5678

 Directory of C:\\cookie-consent

12/13/2025  12:00 PM    <DIR>          .
12/13/2025  12:00 PM    <DIR>          ..
12/13/2025  12:00 PM               256 essential_cookies
12/13/2025  12:00 PM               512 analytics_cookies
               2 File(s)            768 bytes
               2 Dir(s)  1,000,000,000 bytes free`;
				break;

			case "cat":
			case "type":
				if (args[0] === "cookie-config.json") {
					output = `{
  "essential_cookies": {
    "enabled": true,
    "required": true,
    "description": "Required for basic functionality"
  },
  "analytics_cookies": {
    "enabled": ${consentGiven},
    "required": false,
    "description": "Analytics and performance tracking"
  }
}`;
				} else if (args[0]) {
					output = `cat: ${args[0]}: No such file or directory`;
				} else {
					output =
						"cat: missing file operand\nTry 'cat --help' for more information.";
				}
				break;

			case "clear":
			case "cls":
				output = "";
				break;

			case "status":
			case "state":
			case "consent":
				output = `Consent Status:
  essential_cookies: enabled (required)
  analytics_cookies: ${consentGiven ? "enabled" : "disabled"}
  storage_key: analytics-consent`;
				break;

			case "policy":
			case "privacy":
			case "privacy-policy":
			case "privacy_policy":
				output =
					"Privacy policy: open /privacy-policy in your browser.\nTip: Type 'customize' to manage analytics cookies.";
				break;

			case "whoami":
				output = `visitor`;
				break;

			case "pwd":
				output = `/cookie-consent`;
				break;

			case "cd":
				if (args[0] === "..") {
					output = "Cannot go up from root directory.";
				} else if (args[0]) {
					output = `cd: ${args[0]}: No such file or directory`;
				} else {
					output =
						"cd: missing directory operand\nTry 'cd --help' for more information.";
				}
				break;

			case "rm":
				if (lowerCmd.includes("rm -rf") || lowerCmd.includes("rm -r")) {
					if (lowerCmd.includes("*")) {
						output =
							"rm: cannot remove '*': Operation not permitted\nThis is a cookie consent terminal, not a real system!";
					} else if (args[1]) {
						output = `rm: cannot remove '${args[1]}': Permission denied\nEssential cookies cannot be removed.`;
					} else {
						output =
							"rm: missing operand\nTry 'rm --help' for more information.";
					}
				} else {
					output = "rm: missing operand\nTry 'rm --help' for more information.";
				}
				break;

			case "sudo":
				if (lowerCmd.includes("sudo rm -rf") || lowerCmd.includes("sudo rm")) {
					output =
						"sudo: rm -rf: command not allowed\nEven with sudo, you cannot delete cookies here!";
				} else if (args[0] === "apt" && args[1] === "install") {
					output =
						"sudo: apt: command not found\nThis is a web browser, not a Linux system!";
				} else {
					output = `sudo: ${args.join(" ") || "command"}: command not found\nThis terminal doesn't support sudo.`;
				}
				break;

			case "git":
				if (args[0] === "clone") {
					output = `Cloning into '${args[1] || "repository"}'...
fatal: repository '${args[1] || "repository"}' not found\nThis is a cookie consent terminal, not a git repository!`;
				} else if (args[0] === "status") {
					output = `On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean`;
				} else if (args[0] === "push") {
					output =
						"Everything up-to-date\n(But this isn't really a git repository...)";
				} else {
					output = `git: '${args[0] || "command"}' is not a git command. See 'git --help'.\nThis is a cookie consent terminal!`;
				}
				break;

			case "echo":
				const echoText = args.join(" ") || "";
				output = echoText;
				break;

			case "apt":
				if (args[0] === "install") {
					output = `Reading package lists... Done
Building dependency tree... Done
E: Unable to locate package ${args[1] || "package"}\nThis is a web browser, not a Linux system!`;
				} else if (args[0] === "update") {
					output =
						"Ign:1 http://cookie-consent.local InRelease\nThis is a web browser, not a Linux system!";
				} else {
					output = `apt: '${args[0] || "command"}' is not a valid command.\nThis is a web browser, not a Linux system!`;
				}
				break;

			case "npm":
			case "yarn":
			case "pnpm":
				output = `This is a cookie consent terminal, not a Node.js environment!\nTry 'accept' or 'reject' instead.`;
				break;

			case "python":
			case "python3":
				output = `Python 3.11.0 (default, Dec 13 2025, 12:00:00)
[GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> \n(This is not a real Python interpreter!)`;
				break;

			case "node":
				output = `Welcome to Node.js v20.0.0.
Type ".help" for more information.
> \n(This is not a real Node.js REPL!)`;
				break;

			case "docker":
				output =
					"Cannot connect to the Docker daemon. Is the docker daemon running?\n(This is a web browser, not a Docker host!)";
				break;

			case "kubectl":
				output =
					"The connection to the server localhost:8080 was refused - did you specify the right host or port?\n(This is a cookie consent terminal!)";
				break;

			case "ssh":
				output = `ssh: Could not resolve hostname ${args[0] || "host"}: Name or service not known\nThis is a web browser, not an SSH client!`;
				break;

			case "curl":
			case "wget":
				output = `Connecting to ${args[0] || "example.com"}...\nThis is a cookie consent terminal, not a download tool!`;
				break;

			case "vim":
			case "vi":
			case "nano":
				output =
					"This is a cookie consent terminal, not a text editor!\nTry 'accept' or 'reject' instead.";
				break;

			case "top":
			case "htop":
				output =
					"This is a cookie consent terminal, not a system monitor!\nTry 'help' to see available commands.";
				break;

			case "ps":
				output = `  PID TTY          TIME CMD
    1 ?        00:00:00 cookie-consent
    2 ?        00:00:00 browser-process
    3 ?        00:00:00 javascript-engine\n(This is not a real process list!)`;
				break;

			case "kill":
				if (args[0]) {
					output = `kill: (${args[0]}) - No such process\nThis is a cookie consent terminal!`;
				} else {
					output =
						"kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]";
				}
				break;

			case "chmod":
				output = `chmod: cannot access '${args[1] || "file"}': No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "chown":
				output = `chown: cannot access '${args[1] || "file"}': No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "grep":
				output = `grep: ${args[0] || "pattern"}: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "find":
				output = `find: '${args[0] || "."}': No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "tar":
				output =
					"tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' or 'tar --usage' for more information.\n(This is a cookie consent terminal!)";
				break;

			case "zip":
			case "unzip":
				output =
					"This is a cookie consent terminal, not a compression tool!\nTry 'accept' or 'reject' instead.";
				break;

			case "man":
				output = `No manual entry for ${args[0] || "command"}\nThis is a cookie consent terminal!`;
				break;

			case "which":
				output = `which: no ${args[0] || "command"} in (/usr/bin:/bin:/usr/sbin:/sbin)\nThis is a cookie consent terminal!`;
				break;

			case "whereis":
				output = `${args[0] || "command"}: \nThis is a cookie consent terminal!`;
				break;

			case "history":
				output =
					commandHistoryList
						.slice(-10)
						.map(
							(cmd, i) => `${commandHistoryList.length - 10 + i + 1}  ${cmd}`,
						)
						.join("\n") || "No command history yet.";
				break;

			case "neofetch":
				output = (
					<pre className="font-mono text-xs">{`
     ██████╗ ██████╗  ██████╗ ██████╗██╗     ███████╗
    ██╔════╝██╔═══██╗██╔═══██╗██╔════╝██║     ██╔════╝
    ██║     ██║   ██║██║   ██║██║     ██║     █████╗  
    ██║     ██║   ██║██║   ██║██║     ██║     ██╔══╝  
    ╚██████╗╚██████╔╝╚██████╔╝╚██████╗███████╗███████╗
     ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝╚══════╝╚══════╝
                                                    
OS: Web Browser
Host: ${typeof window !== "undefined" ? window.location.hostname : "localhost"}
Kernel: JavaScript Engine
Uptime: ${Math.floor(Date.now() / 1000)} seconds
Shell: cookie-consent.sh
Terminal: Cookie Consent Terminal v2.0
`}</pre>
				);
				break;

			case "matrix":
				output = (
					<div className="font-mono text-[10px] leading-tight text-green-500/80">
						<pre>{`
Wake up, Neo...
The Matrix has you...
Follow the white rabbit.
`}</pre>
						<div className="mt-2 text-accent/60">
							Type "accept" to take the red pill, or "reject" to take the blue
							pill.
						</div>
					</div>
				);
				break;

			case "cowsay":
				const message =
					args.join(" ") || "Moo! Accept cookies for better experience!";
				output = (
					<pre className="font-mono text-xs">{`
< ${message} >
 ----------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`}</pre>
				);
				break;

			case "fortune":
				const fortunes = [
					"You will have a great day today!",
					"Accept cookies and your experience will improve.",
					"The terminal is your friend.",
					"Type 'help' if you're lost.",
					"Easter eggs are hidden everywhere!",
					"Your privacy matters.",
					"Cookies make the web better.",
					"Explore and discover!",
				];
				const randomFortune =
					fortunes[Math.floor(Math.random() * fortunes.length)];
				output = randomFortune;
				break;

			case "analytics":
			case "ga":
			case "tracking":
				output = `Analytics cookies are currently ${consentGiven ? "enabled" : "disabled"}.
Usage:
  analytics on
  analytics off
  toggle analytics`;
				break;

			case "toggle":
				if (args[0] === "analytics") {
					const newValue = !consentGiven;
					setConsent(newValue);
					output = `Analytics cookies ${newValue ? "enabled" : "disabled"}.`;
				} else {
					output = "Usage: toggle analytics";
				}
				break;

			case "exit":
			case "quit":
			case "q":
				output = "Exiting without saving preferences...";
				setTimeout(() => {
					setLastOutput("Goodbye!");
					setTimeout(() => setShowBanner(false), 500);
				}, 500);
				break;

			// More common commands
			case "grep":
				if (args[0]) {
					output = `grep: ${args[1] || "file"}: No such file or directory\nThis is a cookie consent terminal!`;
				} else {
					output =
						"Usage: grep [OPTION]... PATTERN [FILE]...\nTry 'grep --help' for more information.";
				}
				break;

			case "find":
				output = `find: '${args[0] || "."}': No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "mkdir":
				output = `mkdir: cannot create directory '${args[0] || "directory"}': Permission denied\nThis is a cookie consent terminal!`;
				break;

			case "touch":
				output = `touch: cannot touch '${args[0] || "file"}': Permission denied\nThis is a cookie consent terminal!`;
				break;

			case "mv":
				output = `mv: cannot move '${args[0] || "source"}' to '${args[1] || "dest"}': Permission denied\nThis is a cookie consent terminal!`;
				break;

			case "cp":
				output = `cp: cannot copy '${args[0] || "source"}' to '${args[1] || "dest"}': Permission denied\nThis is a cookie consent terminal!`;
				break;

			case "head":
			case "tail":
				output = `${command}: cannot open '${args[0] || "file"}' for reading: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "less":
			case "more":
				output = `${command}: cannot open '${args[0] || "file"}': No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "wc":
				output = `wc: ${args[0] || "file"}: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "sort":
				output = `sort: cannot read: ${args[0] || "file"}: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "uniq":
				output = `uniq: ${args[0] || "file"}: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "diff":
				output = `diff: ${args[0] || "file1"}: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "sed":
			case "awk":
				output = `${command}: ${args[0] || "script"}: No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "tar":
				output =
					"tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' or 'tar --usage' for more information.\n(This is a cookie consent terminal!)";
				break;

			case "zip":
			case "unzip":
				output = `This is a cookie consent terminal, not a compression tool!\nTry 'accept' or 'reject' instead.`;
				break;

			case "man":
				output = `No manual entry for ${args[0] || "command"}\nThis is a cookie consent terminal!`;
				break;

			case "which":
				output = `which: no ${args[0] || "command"} in (/usr/bin:/bin:/usr/sbin:/sbin)\nThis is a cookie consent terminal!`;
				break;

			case "whereis":
				output = `${args[0] || "command"}: \nThis is a cookie consent terminal!`;
				break;

			case "date":
				output = new Date().toString();
				break;

			case "cal":
			case "calendar":
				const now = new Date();
				const month = now.getMonth() + 1;
				const year = now.getFullYear();
				output = `     ${now.toLocaleString("en-US", { month: "long" })} ${year}\nSu Mo Tu We Th Fr Sa\n${" ".repeat(new Date(year, month - 1, 1).getDay() * 3)}...\n(This is not a real calendar!)`;
				break;

			case "uname":
				if (args[0] === "-a") {
					output = `Linux cookie-consent 6.0.0-generic #1 SMP PREEMPT_DYNAMIC\n(This is a web browser, not a real system!)`;
				} else {
					output = "Linux\n(This is a web browser, not a real system!)";
				}
				break;

			case "df":
				output = `Filesystem     1K-blocks  Used Available Use% Mounted on\n/dev/cookie     1000000  50000    950000   5% /\n(This is not a real filesystem!)`;
				break;

			case "du":
				output = `du: cannot access '${args[0] || "."}': No such file or directory\nThis is a cookie consent terminal!`;
				break;

			case "free":
				output = `              total        used        free      shared  buff/cache   available\nMem:        8000000     2000000     5000000          0      1000000     6000000\nSwap:       2000000           0     2000000\n(This is not real memory info!)`;
				break;

			// Attack commands (funny responses)
			case "format":
			case "fdisk":
			case "dd":
				if (
					lowerCmd.includes("if=/dev/zero") ||
					lowerCmd.includes("of=/dev/")
				) {
					output =
						"Permission denied: Nice try, but you can't format a cookie consent terminal!\nThis is a web browser, not a real disk!";
				} else {
					output = `${command}: operation not permitted\nThis is a cookie consent terminal, not a real system!`;
				}
				break;

			case "deltree":
			case "delt":
				output =
					"Access denied. You cannot delete the cookie consent terminal!\nThis is a web browser, not a real file system!";
				break;

			case "shutdown":
			case "reboot":
			case "halt":
			case "poweroff":
				output =
					"shutdown: Must be root.\n(Even if you were root, you can't shut down a web browser this way!)";
				break;

			case "init":
				if (args[0] === "0" || args[0] === "6") {
					output =
						"init: Operation not permitted\nYou cannot shut down a cookie consent terminal!";
				} else {
					output = `init: ${args[0] || "runlevel"}: unknown runlevel\nThis is a cookie consent terminal!`;
				}
				break;

			case "chroot":
				output = `chroot: cannot change root directory to '${args[0] || "/"}': Operation not permitted\nThis is a cookie consent terminal!`;
				break;

			case "su":
				output =
					"su: Authentication failure\n(This is a cookie consent terminal, there's no root user!)";
				break;

			case "passwd":
				output =
					"passwd: Authentication token manipulation error\n(This is a cookie consent terminal, there are no users!)";
				break;

			case "useradd":
			case "userdel":
				output = `${command}: Permission denied\nThis is a cookie consent terminal, you cannot manage users!`;
				break;

			case "iptables":
			case "firewall-cmd":
				output = `${command}: command not found\nThis is a cookie consent terminal, not a real firewall!`;
				break;

			// Random words and responses
			case "hello":
			case "hi":
			case "hey":
				const greetings = [
					"Hello! Type 'help' to see available commands.",
					"Hi there! Want to accept or reject cookies?",
					"Hey! This is a cookie consent terminal.",
					"Hello! Type 'accept' or 'reject' to continue.",
				];
				output = greetings[Math.floor(Math.random() * greetings.length)];
				break;

			case "you":
				output = "Me? I'm just a cookie consent terminal. Nothing special.";
				break;

			case "what":
			case "what?":
				output =
					"This is a cookie consent terminal. Type 'help' for available commands.";
				break;

			case "why":
			case "why?":
				output =
					"Why what? Why cookies? They help improve the website experience.";
				break;

			case "how":
			case "how?":
				output = "How? Just type 'accept' or 'reject' to proceed.";
				break;

			case "where":
			case "where?":
				output =
					"You're in a cookie consent terminal. Type 'pwd' to see the current directory.";
				break;

			case "when":
			case "when?":
				output = `When? Right now! It's ${new Date().toLocaleString()}.`;
				break;

			case "who":
			case "who?":
				output = "Type 'whoami' to see who you are.";
				break;

			case "test":
				output = "Test successful! This terminal is working.";
				break;

			case "ping":
				if (args[0]) {
					output = `PING ${args[0]} (127.0.0.1) 56(84) bytes of data.
64 bytes from ${args[0]}: icmp_seq=1 ttl=64 time=0.123 ms
64 bytes from ${args[0]}: icmp_seq=2 ttl=64 time=0.098 ms
64 bytes from ${args[0]}: icmp_seq=3 ttl=64 time=0.105 ms

--- ${args[0]} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2000ms
rtt min/avg/max/mdev = 0.098/0.109/0.123/0.012 ms`;
				} else {
					output =
						"ping: missing host operand\nTry 'ping --help' for more information.";
				}
				break;

			case "361do":
			case "samuido":
				output =
					"That's the developer's handle! But this is a cookie consent terminal.";
				break;

			case "cookie":
			case "cookies":
				output =
					"Cookies are small text files stored on your device.\nType 'help' to learn more about managing them here.";
				break;

			case "privacy":
				output = "Privacy is important! You can reject cookies if you prefer.";
				break;

			case "fuck":
			case "shit":
			case "damn":
			case "crap":
				const swears = [
					"Language! This is a professional cookie consent terminal.",
					"Please keep it clean. This is a cookie consent terminal.",
					"Let's keep this G-rated. Type 'help' for commands.",
					"Watch your language! Try 'help' instead.",
				];
				output = swears[Math.floor(Math.random() * swears.length)];
				break;

			case "":
				// Empty command, do nothing
				output = "";
				break;

			default:
				// Random responses for unknown commands
				const randomResponses = [
					`Command not found: ${command}. Type 'help' for available commands.`,
					`${command}: command not found\nDid you mean 'help'?`,
					`bash: ${command}: command not found\nThis is a cookie consent terminal!`,
					`${command}: No such file or directory\nTry 'help' to see available commands.`,
					`Unknown command: ${command}\nType 'help' for a list of commands.`,
					`'${command}' is not recognized as a command.\nThis is a cookie consent terminal.`,
					`${command}? Never heard of it.\nTry 'accept' or 'reject' instead.`,
					`I don't know what '${command}' means.\nType 'help' if you're lost.`,
					`${command}... ${command}... Nope, doesn't ring a bell.\nTry 'help'?`,
					`Command '${command}' not found.\nBut hey, try typing 'help'!`,
					`What's '${command}'? I'm just a cookie consent terminal.\nType 'help' for commands.`,
					`${command}? That's not a thing here.\nThis is a cookie consent terminal!`,
					`Sorry, I don't understand '${command}'.\nMaybe try 'help'?`,
					`'${command}' is not a valid command.\nType 'help' to see what you can do.`,
					`I have no idea what '${command}' is.\nTry 'accept' or 'reject' instead?`,
				];
				output =
					randomResponses[Math.floor(Math.random() * randomResponses.length)];
		}

		setLastOutput(output);
		setInputValue("");
		setHistoryIndex(-1);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			executeCommand(inputValue);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			if (commandHistoryList.length > 0) {
				const newIndex =
					historyIndex === -1
						? commandHistoryList.length - 1
						: Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				setInputValue(commandHistoryList[newIndex]);
			}
		} else if (e.key === "ArrowDown") {
			e.preventDefault();
			if (historyIndex >= 0) {
				const newIndex =
					historyIndex >= commandHistoryList.length - 1 ? -1 : historyIndex + 1;
				setHistoryIndex(newIndex);
				setInputValue(newIndex === -1 ? "" : commandHistoryList[newIndex]);
			}
		}
	};

	if (!showBanner) {
		return null;
	}

	return (
		<motion.div
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: "spring", damping: 25, stiffness: 200 }}
			className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
			role="dialog"
			aria-labelledby="cookie-consent-title"
			aria-describedby="cookie-consent-description"
		>
			<div className="max-w-4xl mx-auto p-4 sm:p-6">
				<div className="relative rounded-lg overflow-hidden bg-[#1e1e1e]/95 backdrop-blur-md shadow-2xl border border-white/10">
					{/* Last Output Area */}
					{lastOutput && (
						<div
							id="cookie-consent-description"
							className="p-4 min-h-[50px] max-h-[200px] overflow-y-auto custom-scrollbar bg-[#1e1e1e]"
						>
							<motion.div
								key={Date.now()}
								initial={{ opacity: 0, y: 5 }}
								animate={{ opacity: 1, y: 0 }}
								className="font-mono text-xs text-main/70 whitespace-pre-wrap"
							>
								{typeof lastOutput === "string" ? lastOutput : lastOutput}
							</motion.div>
						</div>
					)}

					{/* Input Area with Question */}
					<div className="border-t border-white/5 p-4 bg-[#252526]">
						<div className="flex items-center gap-3 flex-wrap">
							<span className="text-accent/60 font-mono text-sm select-none">
								$
							</span>
							{!lastOutput && (
								<>
									<span className="text-main/70 font-mono text-sm">
										クッキーを許可しますか？
									</span>
									<span className="text-main/70 font-mono text-sm">&gt;</span>
								</>
							)}
							<div className="flex items-center gap-2 flex-1 min-w-[150px]">
								<input
									ref={inputRef}
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={handleKeyDown}
									className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-main/90 placeholder:text-main/30"
									placeholder=""
									autoFocus
									aria-label="コマンド入力"
								/>
								<motion.span
									animate={{ opacity: [1, 0] }}
									transition={{
										repeat: Infinity,
										duration: 0.8,
										ease: "easeInOut",
									}}
									className="w-2 h-4 bg-accent"
								/>
							</div>
							{/* Show buttons only when no command has been executed */}
							{!lastOutput && (
								<div className="flex items-center gap-2 font-mono text-xs">
									<button
										type="button"
										onClick={handleRejectAll}
										className="px-2 py-1 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-all"
										aria-label="すべて拒否"
									>
										○ reject
									</button>
									<button
										type="button"
										onClick={handleAcceptAll}
										className="px-2 py-1 text-accent/80 hover:text-accent hover:bg-accent/10 transition-all"
										aria-label="すべて受け入れる"
									>
										○ accept
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// Cookie settings component for privacy policy page
export function CookieSettings() {
	const { consentGiven, setConsent } = useAnalytics();
	const [analyticsEnabled, setAnalyticsEnabled] = useState(consentGiven);

	const handleSave = () => {
		setConsent(analyticsEnabled);
		alert("クッキー設定を保存しました！");
	};

	return (
		<div className="max-w-2xl mx-auto p-6 bg-base/95 backdrop-blur-sm border border-white/10 shadow-lg">
			<h2 className="neue-haas-grotesk-display text-2xl text-main mb-4">
				クッキー設定
			</h2>

			<div className="space-y-4">
				{/* Essential Cookies */}
				<div className="border border-white/10 bg-white/5 backdrop-blur-sm p-4">
					<div className="flex items-center justify-between mb-2">
						<h3 className="neue-haas-grotesk-display text-base text-main">
							必須クッキー
						</h3>
						<span className="noto-sans-jp-light text-xs text-main/60 bg-main/10 px-2 py-1">
							常に有効
						</span>
					</div>
					<p className="noto-sans-jp-light text-sm text-main/80">
						基本的なウェブサイト機能に必要です.無効にすることはできません.
					</p>
				</div>

				{/* Analytics Cookies */}
				<div className="border border-white/10 bg-white/5 backdrop-blur-sm p-4">
					<div className="flex items-center justify-between mb-2">
						<h3 className="neue-haas-grotesk-display text-base text-main">
							分析クッキー
						</h3>
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								className="sr-only peer"
								checked={analyticsEnabled}
								onChange={(e) => setAnalyticsEnabled(e.target.checked)}
							/>
							<div className="w-11 h-6 bg-main/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-base after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
						</label>
					</div>
					<p className="noto-sans-jp-light text-sm text-main/80">
						利用パターンを分析することで、ウェブサイトの改善に役立ちます.
					</p>
				</div>
			</div>

			<div className="mt-6 flex justify-end">
				<button
					type="button"
					onClick={handleSave}
					className="group flex items-center h-10 px-4 bg-accent/20 border border-accent/40 hover:bg-accent/30 hover:border-accent/60 transition-all duration-300"
				>
					<span className="w-1 h-full bg-accent group-hover:bg-accent transition-colors duration-300" />
					<span className="flex-1 text-sm font-medium text-main group-hover:text-main pl-4 tracking-wide transition-colors duration-300">
						設定を保存
					</span>
				</button>
			</div>
		</div>
	);
}
