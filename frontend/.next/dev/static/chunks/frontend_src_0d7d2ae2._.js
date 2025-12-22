(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/src/components/Header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function Header() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(30);
    if ($[0] !== "163c079624e0348ffc26e9ffe6629e6f9c64dcf6612fe5d3238cda0f23f1dd09") {
        for(let $i = 0; $i < 30; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "163c079624e0348ffc26e9ffe6629e6f9c64dcf6612fe5d3238cda0f23f1dd09";
    }
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const [, setShowSearchResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const isLoggedIn = status === "authenticated";
    const isLoading = status === "loading";
    let t0;
    if ($[1] !== router || $[2] !== searchQuery) {
        t0 = ({
            "Header[handleSearch]": (e)=>{
                e.preventDefault();
                if (searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                    setShowSearchResults(false);
                    setSearchQuery("");
                }
            }
        })["Header[handleSearch]"];
        $[1] = router;
        $[2] = searchQuery;
        $[3] = t0;
    } else {
        t0 = $[3];
    }
    const handleSearch = t0;
    if (isLoading) {
        let t1;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-white shadow-sm border-b",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-4 py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-white font-bold text-sm",
                                            children: "R"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/components/Header.tsx",
                                            lineNumber: 48,
                                            columnNumber: 282
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/Header.tsx",
                                        lineNumber: 48,
                                        columnNumber: 201
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-2xl font-bold text-gray-900",
                                        children: "Request"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/components/Header.tsx",
                                        lineNumber: 48,
                                        columnNumber: 343
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/components/Header.tsx",
                                lineNumber: 48,
                                columnNumber: 156
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-gray-600",
                                children: "Cargando..."
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/Header.tsx",
                                lineNumber: 48,
                                columnNumber: 410
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/Header.tsx",
                        lineNumber: 48,
                        columnNumber: 105
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/src/components/Header.tsx",
                    lineNumber: 48,
                    columnNumber: 60
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/Header.tsx",
                lineNumber: 48,
                columnNumber: 12
            }, this);
            $[4] = t1;
        } else {
            t1 = $[4];
        }
        return t1;
    }
    const t1 = isLoggedIn ? "/dashboard" : "/";
    let t2;
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-white font-bold text-sm",
                children: "R"
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/Header.tsx",
                lineNumber: 59,
                columnNumber: 91
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 59,
            columnNumber: 10
        }, this);
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "text-2xl font-bold text-gray-900",
            children: "Request"
        }, void 0, false, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 60,
            columnNumber: 10
        }, this);
        $[5] = t2;
        $[6] = t3;
    } else {
        t2 = $[5];
        t3 = $[6];
    }
    let t4;
    if ($[7] !== t1) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: t1,
            className: "flex items-center space-x-2",
            children: [
                t2,
                t3
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 69,
            columnNumber: 10
        }, this);
        $[7] = t1;
        $[8] = t4;
    } else {
        t4 = $[8];
    }
    let t5;
    if ($[9] !== isLoggedIn || $[10] !== pathname) {
        t5 = isLoggedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "hidden md:flex items-center space-x-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/dashboard",
                    className: `${pathname === "/dashboard" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`,
                    children: "Dashboard"
                }, void 0, false, {
                    fileName: "[project]/frontend/src/components/Header.tsx",
                    lineNumber: 77,
                    columnNumber: 79
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/profile",
                    className: `${pathname === "/profile" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`,
                    children: "Mi Perfil"
                }, void 0, false, {
                    fileName: "[project]/frontend/src/components/Header.tsx",
                    lineNumber: 77,
                    columnNumber: 230
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 77,
            columnNumber: 24
        }, this);
        $[9] = isLoggedIn;
        $[10] = pathname;
        $[11] = t5;
    } else {
        t5 = $[11];
    }
    let t6;
    if ($[12] !== t4 || $[13] !== t5) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-8",
            children: [
                t4,
                t5
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 86,
            columnNumber: 10
        }, this);
        $[12] = t4;
        $[13] = t5;
        $[14] = t6;
    } else {
        t6 = $[14];
    }
    const t7 = `${pathname === "/requests" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`;
    let t8;
    if ($[15] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/requests",
            className: t7,
            children: "📨 Solicitudes"
        }, void 0, false, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 96,
            columnNumber: 10
        }, this);
        $[15] = t7;
        $[16] = t8;
    } else {
        t8 = $[16];
    }
    let t9;
    if ($[17] !== handleSearch || $[18] !== isLoggedIn || $[19] !== searchQuery) {
        t9 = isLoggedIn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 max-w-2xl mx-8 relative",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSearch,
                className: "relative",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Buscar personas, proyectos, oportunidades...",
                            value: searchQuery,
                            onChange: {
                                "Header[<input>.onChange]": (e_0)=>setSearchQuery(e_0.target.value)
                            }["Header[<input>.onChange]"],
                            onFocus: {
                                "Header[<input>.onFocus]": ()=>setShowSearchResults(true)
                            }["Header[<input>.onFocus]"],
                            className: "w-full px-4 py-2 pl-10 pr-4 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/Header.tsx",
                            lineNumber: 104,
                            columnNumber: 149
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-500",
                                children: "🔍"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/Header.tsx",
                                lineNumber: 108,
                                columnNumber: 303
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/components/Header.tsx",
                            lineNumber: 108,
                            columnNumber: 217
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/Header.tsx",
                    lineNumber: 104,
                    columnNumber: 123
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/Header.tsx",
                lineNumber: 104,
                columnNumber: 72
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 104,
            columnNumber: 24
        }, this);
        $[17] = handleSearch;
        $[18] = isLoggedIn;
        $[19] = searchQuery;
        $[20] = t9;
    } else {
        t9 = $[20];
    }
    let t10;
    if ($[21] !== isLoggedIn || $[22] !== pathname || $[23] !== session?.user?.name) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: "flex items-center space-x-4",
            children: isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden sm:flex items-center space-x-2 text-sm text-gray-600",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Hola,"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/Header.tsx",
                                lineNumber: 118,
                                columnNumber: 149
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-medium",
                                children: session?.user?.name
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/components/Header.tsx",
                                lineNumber: 118,
                                columnNumber: 167
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/components/Header.tsx",
                        lineNumber: 118,
                        columnNumber: 72
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: _HeaderButtonOnClick,
                        className: "text-gray-600 hover:text-blue-600",
                        children: "Cerrar Sesión"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Header.tsx",
                        lineNumber: 118,
                        columnNumber: 231
                    }, this)
                ]
            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/login",
                        className: `${pathname === "/login" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`,
                        children: "Iniciar Sesión"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Header.tsx",
                        lineNumber: 118,
                        columnNumber: 346
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/register",
                        className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium",
                        children: "Registrarse"
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/components/Header.tsx",
                        lineNumber: 118,
                        columnNumber: 494
                    }, this)
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 118,
            columnNumber: 11
        }, this);
        $[21] = isLoggedIn;
        $[22] = pathname;
        $[23] = session?.user?.name;
        $[24] = t10;
    } else {
        t10 = $[24];
    }
    let t11;
    if ($[25] !== t10 || $[26] !== t6 || $[27] !== t8 || $[28] !== t9) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "bg-white shadow-sm border-b",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 py-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between",
                    children: [
                        t6,
                        t8,
                        t9,
                        t10
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/components/Header.tsx",
                    lineNumber: 128,
                    columnNumber: 104
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/src/components/Header.tsx",
                lineNumber: 128,
                columnNumber: 59
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/src/components/Header.tsx",
            lineNumber: 128,
            columnNumber: 11
        }, this);
        $[25] = t10;
        $[26] = t6;
        $[27] = t8;
        $[28] = t9;
        $[29] = t11;
    } else {
        t11 = $[29];
    }
    return t11;
}
_s(Header, "0XEwtFY9GLYs+NaXdKFdiZ+p4wk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = Header;
function _HeaderButtonOnClick() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])({
        callbackUrl: "/"
    });
}
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/lib/api/config.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/api/config.ts
__turbopack_context__.s([
    "API_BASE_URL",
    ()=>API_BASE_URL,
    "API_CONFIG",
    ()=>API_CONFIG,
    "API_ENDPOINTS",
    ()=>API_ENDPOINTS
]);
const API_BASE_URL = "http://127.0.0.1";
const API_ENDPOINTS = {
    // Infraestructura Base
    NOTIFICATIONS: `${API_BASE_URL}:4001`,
    // Servicios Principales
    POSTS: `${API_BASE_URL}:4002`,
    REQUESTS: `${API_BASE_URL}:4003`,
    AUTH: `${API_BASE_URL}:4004`,
    PROFILE: `${API_BASE_URL}:4005`,
    RATINGS: `${API_BASE_URL}:4006`,
    USERS: `${API_BASE_URL}:4007`,
    // Chat & Mensajería
    MESSAGES: `${API_BASE_URL}:4008`,
    CONVERSATIONS: `${API_BASE_URL}:4009`,
    // OJO: El servicio 'chat-service' no aparece en tu docker ps.
    // Si existe, verifica si se cayó o si usa otro puerto. Asumo 4010 por patrón.
    CHAT: `${API_BASE_URL}:4010`
};
const API_CONFIG = {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    BASE_PATH: "/api"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/lib/api/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiClient",
    ()=>ApiClient,
    "ApiError",
    ()=>ApiError,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)"); // 👈 IMPORTANTE: Importamos esto
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/api/config.ts [app-client] (ecmascript)");
;
;
class ApiError extends Error {
    status;
    data;
    constructor(message, status, data){
        super(message), this.status = status, this.data = data;
        this.name = "ApiError";
    }
}
class ApiClient {
    // 👇 AQUÍ ESTÁ LA MAGIA DE LA AUTENTICACIÓN
    static async fetchWithAuth(url, options = {}) {
        // 1. Obtener la sesión actual
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSession"])();
        const token = session?.accessToken; // Recuperamos el token que guardamos en auth.ts
        // 2. Construir headers con el token
        const headers = {
            "Content-Type": "application/json",
            // Si hay token, lo inyectamos como Bearer
            ...token && {
                Authorization: `Bearer ${token}`
            },
            ...options.headers
        };
        return fetch(url, {
            ...options,
            headers,
            credentials: "include"
        });
    }
    static async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(data.message || "Error en la solicitud", response.status, data);
        }
        return data;
    }
    // Métodos HTTP genéricos
    static async get(url, params) {
        const query = params ? new URLSearchParams(params).toString() : "";
        const fullUrl = query ? `${url}?${query}` : url;
        const response = await this.fetchWithAuth(fullUrl, {
            method: "GET"
        });
        return this.handleResponse(response);
    }
    static async post(url, body) {
        const response = await this.fetchWithAuth(url, {
            method: "POST",
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    }
    static async put(url, body) {
        const response = await this.fetchWithAuth(url, {
            method: "PUT",
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    }
    static async delete(url) {
        const response = await this.fetchWithAuth(url, {
            method: "DELETE"
        });
        return this.handleResponse(response);
    }
    // ========== AUTH SERVICE ==========
    static auth = {
        register: async (data)=>{
            try {
                // Registro no suele requerir Auth header, pero no hace daño
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].AUTH}/register`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        login: async (credentials)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].AUTH}/login`, credentials);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        logout: async ()=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].AUTH}/logout`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
    // ========== USERS SERVICE ==========
    static users = {
        getUserProfile: async (userId)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].USERS}/${userId}`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        createProfile: async (data)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].USERS}/profile`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        updateProfile: async (userId, data)=>{
            try {
                const response = await ApiClient.put(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].USERS}/${userId}/profile`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        searchUsers: async (params)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].USERS}/search`, params);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        getUsersByCareer: async (career, page = 1, limit = 20)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].USERS}/career/${career}`, {
                    page,
                    limit
                });
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
    // ========== POSTS SERVICE ==========
    static posts = {
        createPost: async (data)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].POSTS}`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        getPosts: async (params)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].POSTS}`, params);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        getPostById: async (postId)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].POSTS}/${postId}`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        updatePost: async (postId, data)=>{
            try {
                const response = await ApiClient.put(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].POSTS}/${postId}`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        deletePost: async (postId)=>{
            try {
                const response = await ApiClient.delete(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].POSTS}/${postId}`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
    // ========== REQUESTS SERVICE ==========
    static requests = {
        createRequest: async (data)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].REQUESTS}`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        getUserRequests: async (userId, type = "all")=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].REQUESTS}/user/${userId}?type=${type}`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        updateRequestStatus: async (requestId, status)=>{
            try {
                const response = await ApiClient.put(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].REQUESTS}/${requestId}/status`, {
                    status
                });
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        completeRequest: async (requestId, data)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].REQUESTS}/${requestId}/complete`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
    // ========== CHAT SERVICE ==========
    static chat = {
        getUserConversations: async (userId)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CHAT}/user/${userId}/conversations`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        getConversationMessages: async (conversationId)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CHAT}/conversation/${conversationId}/messages`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        sendMessage: async (conversationId, data)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].CHAT}/conversation/${conversationId}/messages`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
    // ========== RATINGS SERVICE ==========
    static ratings = {
        getUserRating: async (userId)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].RATINGS}/user/${userId}`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        submitRating: async (data)=>{
            try {
                const response = await ApiClient.post(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].RATINGS}`, data);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
    // ========== NOTIFICATIONS SERVICE ==========
    static notifications = {
        getUserNotifications: async (userId)=>{
            try {
                const response = await ApiClient.get(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].NOTIFICATIONS}/user/${userId}`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        },
        markAsRead: async (notificationId)=>{
            try {
                const response = await ApiClient.put(`${__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$config$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].NOTIFICATIONS}/${notificationId}/read`);
                return response;
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof ApiError ? error.message : "Error desconocido"
                };
            }
        }
    };
}
const __TURBOPACK__default__export__ = ApiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/src/app/requests/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RequestsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/components/Header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
// IMPORTANTE: Importamos Request y ApiClient desde el mismo lugar
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/src/lib/api/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// BORRA LA INTERFAZ 'Request' LOCAL PARA USAR LA IMPORTADA
const requestStatus = {
    PENDING: {
        label: "Pendiente",
        color: "bg-yellow-100 text-yellow-800"
    },
    ACCEPTED: {
        label: "Aceptada",
        color: "bg-green-100 text-green-800"
    },
    REJECTED: {
        label: "Rechazada",
        color: "bg-red-100 text-red-800"
    },
    COMPLETED: {
        label: "Completada",
        color: "bg-blue-100 text-blue-800"
    }
};
const requestTypes = {
    COLLABORATION: {
        label: "🤝 Colaboración",
        color: "bg-purple-100 text-purple-800"
    },
    ADVICE: {
        label: "💡 Asesoría",
        color: "bg-orange-100 text-orange-800"
    },
    JOB_OFFER: {
        label: "💼 Trabajo",
        color: "bg-green-100 text-green-800"
    },
    MENTORSHIP: {
        label: "🎓 Mentoría",
        color: "bg-blue-100 text-blue-800"
    }
};
function RequestsPage() {
    _s();
    const { data: session } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    // Estados existentes
    const [requests, setRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    // === CORRECCIÓN 1: AGREGAR ESTADOS FALTANTES ===
    const [showCompleteModal, setShowCompleteModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedRequest, setSelectedRequest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [acceptingRequest, setAcceptingRequest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RequestsPage.useEffect": ()=>{
            loadRequests();
        }
    }["RequestsPage.useEffect"], [
        activeTab,
        session?.user?.id
    ]);
    const loadRequests = async ()=>{
        if (!session?.user?.id) return;
        try {
            setIsLoading(true);
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiClient"].requests.getUserRequests(session.user.id, activeTab);
            // === CORRECCIÓN 2: ACCEDER A LA DATA CORRECTAMENTE ===
            if (result.success && result.data) {
                setRequests(result.data.requests || []);
            } else {
                setRequests([]); // Limpiar si falla o no hay data
                if (!result.success) setError(result.error || "Error al cargar las solicitudes");
            }
        } catch (err) {
            setError("Error de conexión");
            console.error(err);
        } finally{
            setIsLoading(false);
        }
    };
    const handleAccept = async (requestId, otherUserId)=>{
        try {
            setAcceptingRequest(requestId); // Usamos el estado de carga para el botón
            const result_0 = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiClient"].requests.updateRequestStatus(requestId, "ACCEPTED");
            if (result_0.success) {
                window.location.href = `/chat/${otherUserId}`;
            } else {
                alert(result_0.error || "Error al aceptar la solicitud");
            }
        } catch (err_0) {
            alert("Error de conexión");
        } finally{
            setAcceptingRequest(null);
        }
    };
    const handleReject = async (requestId_0)=>{
        try {
            const result_1 = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiClient"].requests.updateRequestStatus(requestId_0, "REJECTED");
            if (result_1.success) {
                loadRequests();
                alert("Solicitud rechazada exitosamente");
            } else {
                alert(result_1.error || "Error al rechazar la solicitud");
            }
        } catch (err_1) {
            alert("Error de conexión");
        }
    };
    const openChat = (otherUserId_0)=>{
        window.location.href = `/chat/${otherUserId_0}`;
    };
    // Estas funciones ahora funcionarán porque definimos los estados arriba
    const openCompleteModal = (request)=>{
        setSelectedRequest(request);
        setShowCompleteModal(true);
    };
    const handleCompleteSuccess = ()=>{
        setShowCompleteModal(false);
        setSelectedRequest(null);
        loadRequests();
    };
    const renderStars = (rating)=>{
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-1",
            children: [
                1,
                2,
                3,
                4,
                5
            ].map((star)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `text-sm ${star <= Math.round(rating || 0) ? "text-yellow-400" : "text-gray-300"}`,
                    children: "★"
                }, star, false, {
                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                    lineNumber: 130,
                    columnNumber: 38
                }, this))
        }, void 0, false, {
            fileName: "[project]/frontend/src/app/requests/page.tsx",
            lineNumber: 129,
            columnNumber: 12
        }, this);
    };
    if (!session) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-h-screen bg-gray-50 flex items-center justify-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-2xl font-bold text-gray-900",
                                children: "No has iniciado sesión"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                lineNumber: 140,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 mt-2",
                                children: "Por favor inicia sesión para ver tus solicitudes"
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                lineNumber: 143,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                        lineNumber: 139,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                    lineNumber: 138,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$components$2f$Header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/frontend/src/app/requests/page.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "min-h-screen bg-gray-50 py-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-6xl mx-auto px-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-3xl font-bold text-gray-900",
                                        children: "Mis Solicitudes"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                        lineNumber: 155,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-600 mt-2",
                                        children: "Gestiona tus solicitudes de colaboración recibidas y enviadas"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                        lineNumber: 158,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                lineNumber: 154,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white rounded-xl shadow-sm p-1 mb-6 inline-flex",
                                children: [
                                    {
                                        id: "all",
                                        label: "Todas"
                                    },
                                    {
                                        id: "received",
                                        label: "Recibidas"
                                    },
                                    {
                                        id: "sent",
                                        label: "Enviadas"
                                    }
                                ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveTab(tab.id),
                                        className: `px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"}`,
                                        children: tab.label
                                    }, tab.id, false, {
                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                        lineNumber: 173,
                                        columnNumber: 25
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6",
                                children: error
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                lineNumber: 178,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 184,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 mt-4",
                                            children: "Cargando solicitudes..."
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 185,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 183,
                                    columnNumber: 26
                                }, this) : requests.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-12 bg-white rounded-xl",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-6xl mb-4",
                                            children: "📭"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 187,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-xl font-semibold text-gray-900 mb-2",
                                            children: activeTab === "received" ? "No tienes solicitudes recibidas" : activeTab === "sent" ? "No has enviado solicitudes" : "No hay solicitudes"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 188,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-600 mb-4",
                                            children: activeTab === "received" ? "Las solicitudes que recibas aparecerán aquí." : activeTab === "sent" ? "Las solicitudes que envíes aparecerán aquí." : "Comienza a conectar con otros usuarios enviando solicitudes."
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 191,
                                            columnNumber: 17
                                        }, this),
                                        activeTab !== "sent" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/dashboard",
                                            className: "inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700",
                                            children: "Explorar Usuarios"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 194,
                                            columnNumber: 42
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 186,
                                    columnNumber: 48
                                }, this) : requests.map((request_0)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white rounded-xl shadow-sm p-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-start mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start space-x-4",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-gray-700",
                                                                    children: activeTab === "sent" ? request_0.toUser.name.charAt(0) : request_0.fromUser.name.charAt(0)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                    lineNumber: 201,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 200,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                        className: "font-semibold text-gray-900",
                                                                        children: activeTab === "sent" ? `Para: ${request_0.toUser.name}` : `De: ${request_0.fromUser.name}`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                        lineNumber: 206,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center space-x-2 text-sm text-gray-600 mt-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: activeTab === "sent" ? request_0.toUser.career : request_0.fromUser.career
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                                lineNumber: 210,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: "•"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                                lineNumber: 213,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: [
                                                                                    activeTab === "sent" ? request_0.toUser.semester : request_0.fromUser.semester,
                                                                                    "° Semestre"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                                lineNumber: 214,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                children: "•"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                                lineNumber: 218,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-center space-x-1",
                                                                                children: [
                                                                                    renderStars(activeTab === "sent" ? request_0.toUser.rating || 0 : request_0.fromUser.rating || 0),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "font-medium",
                                                                                        children: activeTab === "sent" ? request_0.toUser.rating ? request_0.toUser.rating.toFixed(1) : "Nuevo" : request_0.fromUser.rating ? request_0.fromUser.rating.toFixed(1) : "Nuevo"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                                        lineNumber: 221,
                                                                                        columnNumber: 29
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                                lineNumber: 219,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                        lineNumber: 209,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 205,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `px-2 py-1 rounded-full text-xs font-medium ${requestTypes[request_0.type]?.color || "bg-gray-100 text-gray-800"}`,
                                                                children: requestTypes[request_0.type]?.label || request_0.type
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 229,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `px-2 py-1 rounded-full text-xs font-medium ${requestStatus[request_0.status]?.color || "bg-gray-100 text-gray-800"}`,
                                                                children: requestStatus[request_0.status]?.label || request_0.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 232,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 228,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                lineNumber: 198,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-700 bg-gray-50 p-3 rounded-lg",
                                                    children: request_0.message
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                    lineNumber: 239,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                lineNumber: 238,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-center text-sm text-gray-600 mb-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex space-x-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "📅",
                                                                " ",
                                                                new Date(request_0.createdAt).toLocaleDateString("es-ES")
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                            lineNumber: 246,
                                                            columnNumber: 23
                                                        }, this),
                                                        request_0._count.messages > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                "💬 ",
                                                                request_0._count.messages,
                                                                " mensajes"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                            lineNumber: 250,
                                                            columnNumber: 57
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                    lineNumber: 245,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                lineNumber: 244,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-center pt-4 border-t border-gray-200",
                                                children: [
                                                    activeTab === "received" && request_0.status === "PENDING" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleReject(request_0.id),
                                                                className: "border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium",
                                                                children: "Rechazar"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 256,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>handleAccept(request_0.id, request_0.fromUser.id),
                                                                disabled: acceptingRequest === request_0.id,
                                                                className: "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:bg-green-400 disabled:cursor-not-allowed",
                                                                children: acceptingRequest === request_0.id ? "Aceptando..." : "Aceptar y Chatear"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 259,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 255,
                                                        columnNumber: 84
                                                    }, this),
                                                    (request_0.status === "ACCEPTED" || request_0.status === "COMPLETED") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex space-x-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>{
                                                                    const otherUserId_1 = activeTab === "sent" ? request_0.toUser.id : request_0.fromUser.id;
                                                                    openChat(otherUserId_1);
                                                                },
                                                                className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center space-x-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "💬"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                        lineNumber: 269,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Ir al Chat"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                        lineNumber: 270,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 265,
                                                                columnNumber: 25
                                                            }, this),
                                                            request_0.status === "ACCEPTED" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>openCompleteModal(request_0),
                                                                className: "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium flex items-center space-x-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "✅"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                        lineNumber: 275,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "Completar"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                        lineNumber: 276,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                                lineNumber: 274,
                                                                columnNumber: 61
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 264,
                                                        columnNumber: 95
                                                    }, this),
                                                    activeTab === "sent" && request_0.status === "PENDING" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-500",
                                                        children: "Esperando respuesta..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 280,
                                                        columnNumber: 80
                                                    }, this),
                                                    request_0.status === "REJECTED" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-red-500 font-medium",
                                                        children: "Solicitud rechazada"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 284,
                                                        columnNumber: 57
                                                    }, this),
                                                    request_0.status === "COMPLETED" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center space-x-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm text-green-600 font-medium",
                                                            children: "✅ Acuerdo completado"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                            lineNumber: 289,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                        lineNumber: 288,
                                                        columnNumber: 58
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                                lineNumber: 254,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, request_0.id, true, {
                                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                                        lineNumber: 197,
                                        columnNumber: 50
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/src/app/requests/page.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                        lineNumber: 153,
                        columnNumber: 9
                    }, this),
                    showCompleteModal && selectedRequest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompleteRequestModal, {
                        requestId: selectedRequest.id,
                        otherUserName: activeTab === "sent" ? selectedRequest.toUser.name : selectedRequest.fromUser.name,
                        onClose: ()=>setShowCompleteModal(false),
                        onSuccess: handleCompleteSuccess
                    }, void 0, false, {
                        fileName: "[project]/frontend/src/app/requests/page.tsx",
                        lineNumber: 298,
                        columnNumber: 50
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/src/app/requests/page.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(RequestsPage, "sD4luJBj+BclxVGEGhfFOT8ThUU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"]
    ];
});
_c = RequestsPage;
// Componente Modal para Cerrar Acuerdo
function CompleteRequestModal({ requestId, otherUserName, onClose, onSuccess }) {
    _s1();
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [review, setReview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (rating === 0) {
            setError("Por favor selecciona una calificación");
            return;
        }
        try {
            setIsSubmitting(true);
            setError("");
            // === CORRECCIÓN 3: USAR APICLIENT EN LUGAR DE FETCH MANUAL ===
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$src$2f$lib$2f$api$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiClient"].requests.completeRequest(requestId, {
                rating,
                review: review.trim()
            });
            if (result.success) {
                alert("Acuerdo completado exitosamente");
                onSuccess();
            } else {
                setError(result.error || "Error al completar el acuerdo");
            }
        } catch (err) {
            setError("Error de conexión");
        } finally{
            setIsSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-lg max-w-md w-full p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-bold text-gray-900",
                            children: [
                                "Cerrar Acuerdo con ",
                                otherUserName
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                            lineNumber: 349,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-gray-400 hover:text-gray-600 text-2xl",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                            lineNumber: 352,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                    lineNumber: 348,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: [
                                        "Califica a ",
                                        otherUserName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 359,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex space-x-1",
                                    children: [
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map((star)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setRating(star),
                                            className: "text-2xl focus:outline-none",
                                            children: star <= rating ? "⭐" : "☆"
                                        }, star, false, {
                                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                                            lineNumber: 363,
                                            columnNumber: 44
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 362,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                            lineNumber: 358,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "review",
                                    className: "block text-sm font-medium text-gray-700 mb-2",
                                    children: "Comentario (opcional)"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    id: "review",
                                    value: review,
                                    onChange: (e_0)=>setReview(e_0.target.value),
                                    placeholder: `Comparte tu experiencia trabajando con ${otherUserName}...`,
                                    rows: 3,
                                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 373,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                            lineNumber: 369,
                            columnNumber: 11
                        }, this),
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                            lineNumber: 376,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-3 pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium",
                                    disabled: isSubmitting,
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 381,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isSubmitting || rating === 0,
                                    className: "flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed",
                                    children: isSubmitting ? "Enviando..." : "Enviar Calificación"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                                    lineNumber: 384,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/src/app/requests/page.tsx",
                            lineNumber: 380,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/src/app/requests/page.tsx",
                    lineNumber: 357,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/src/app/requests/page.tsx",
            lineNumber: 347,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/src/app/requests/page.tsx",
        lineNumber: 346,
        columnNumber: 10
    }, this);
}
_s1(CompleteRequestModal, "+eFT0aA9CSTC3WQGucgkpKzQ648=");
_c1 = CompleteRequestModal;
var _c, _c1;
__turbopack_context__.k.register(_c, "RequestsPage");
__turbopack_context__.k.register(_c1, "CompleteRequestModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_src_0d7d2ae2._.js.map