"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = isSuperAdmin;
exports.getAllInvitations = getAllInvitations;
exports.createInvitation = createInvitation;
exports.updateInvitation = updateInvitation;
exports.deleteInvitation = deleteInvitation;
exports.getInvitationById = getInvitationById;
var supabase_1 = require("@/src/lib/supabase");
var supabase_admin_1 = require("./supabase-admin");
var supabase_2 = require("@/src/lib/supabase");
var default_invitation_1 = require("@/src/lib/default-invitation");
/**
 * Check if the current user (from the anon client session) is a super admin.
 * We compare the user's email to a list of admin emails from the environment.
 * @param supabaseClient - Optional SupabaseClient to use. If not provided, the anon client is used.
 */
function isSuperAdmin(supabaseClient) {
    return __awaiter(this, void 0, void 0, function () {
        var sb, user, adminEmailsEnv, adminEmails, isAdmin;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!supabase_2.isSupabaseConfigured) {
                        console.log("[ADMIN DEBUG] Supabase not configured");
                        return [2 /*return*/, false];
                    }
                    sb = supabaseClient !== null && supabaseClient !== void 0 ? supabaseClient : supabase_1.supabase;
                    return [4 /*yield*/, sb.auth.getUser()];
                case 1:
                    user = (_e.sent()).data.user;
                    // Debug logging (avoid exposing secrets)
                    console.log("[ADMIN DEBUG] Checking super admin status:");
                    console.log("[ADMIN DEBUG]   User exists:", !!user);
                    if (user) {
                        console.log("[ADMIN DEBUG]   User email:", user.email);
                    }
                    if (!user) {
                        console.log("[ADMIN DEBUG]   No user logged in");
                        return [2 /*return*/, false];
                    }
                    adminEmailsEnv = process.env.SUPABASE_ADMIN_EMAILS;
                    console.log("[ADMIN DEBUG]   SUPABASE_ADMIN_EMAILS set:", !!adminEmailsEnv);
                    if (adminEmailsEnv) {
                        console.log("[ADMIN DEBUG]   SUPABASE_ADMIN_EMAILS value:", adminEmailsEnv);
                    }
                    if (!adminEmailsEnv) {
                        console.log("[ADMIN DEBUG]   No admin emails configured");
                        // Fallback: if no env var, we can treat the first user as admin? Not safe.
                        // We'll return false by default.
                        return [2 /*return*/, false];
                    }
                    adminEmails = adminEmailsEnv
                        .split(",")
                        .map(function (email) { return email.trim().toLowerCase(); })
                        .filter(function (email) { return email.length > 0; });
                    console.log("[ADMIN DEBUG]   Parsed admin emails:", adminEmails);
                    console.log("[ADMIN DEBUG]   User email (lowercase):", (_b = (_a = user.email) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "");
                    isAdmin = adminEmails.includes((_d = (_c = user.email) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : "");
                    console.log("[ADMIN DEBUG]   isSuperAdmin result:", isAdmin);
                    return [2 /*return*/, isAdmin];
            }
        });
    });
}
/**
 * Get all invitations with optional search and pagination.
 * Uses service role client to bypass RLS, but we assume the caller has
 * already checked that they are a super admin.
 */
function getAllInvitations(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var supabaseAdmin, query, _c, data, error, count;
        var _d = _b.search, search = _d === void 0 ? "" : _d, _e = _b.limit, limit = _e === void 0 ? 50 : _e, _f = _b.offset, offset = _f === void 0 ? 0 : _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!supabase_2.isSupabaseConfigured) {
                        return [2 /*return*/, { invitations: [], count: 0 }];
                    }
                    supabaseAdmin = (0, supabase_admin_1.getSupabaseAdmin)();
                    query = supabaseAdmin
                        .from("invitations")
                        .select("id, slug, template, meta, created_at, updated_at", { count: "exact" });
                    if (search) {
                        // Search in meta.title and slug
                        query = query.or("meta.title.ilike.%".concat(search, "%,slug.ilike.%").concat(search, "%"));
                    }
                    return [4 /*yield*/, query
                            .order("created_at", { ascending: false })
                            .range(offset, offset + limit - 1)];
                case 1:
                    _c = _g.sent(), data = _c.data, error = _c.error, count = _c.count;
                    if (error) {
                        console.error("Failed to fetch invitations:", error);
                        throw error;
                    }
                    return [2 /*return*/, { invitations: data !== null && data !== void 0 ? data : [], count: count !== null && count !== void 0 ? count : 0 }];
            }
        });
    });
}
/**
 * Create a new invitation.
 * We expect the caller to provide the meta fields (title, description, url, ogImage) and template.
 * Other fields are set to default empty values.
 */
function createInvitation(data) {
    return __awaiter(this, void 0, void 0, function () {
        var allowedTemplates, supabaseAdmin, baseSlug, slug, counter, _a, existing, existingError, invitationToInsert, _b, inserted, error;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!supabase_2.isSupabaseConfigured) {
                        throw new Error("Supabase not configured");
                    }
                    allowedTemplates = ["ayutika", "template02"];
                    if (!allowedTemplates.includes(data.template)) {
                        throw new Error("Invalid template");
                    }
                    supabaseAdmin = (0, supabase_admin_1.getSupabaseAdmin)();
                    baseSlug = data.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    slug = baseSlug;
                    counter = 0;
                    _c.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    return [4 /*yield*/, supabaseAdmin
                            .from("invitations")
                            .select("id")
                            .eq("slug", slug)
                            .single()];
                case 2:
                    _a = _c.sent(), existing = _a.data, existingError = _a.error;
                    if (existingError && existingError.code !== "PGRST116") {
                        // PGRST116 means no rows found, which is good
                        console.error("Error checking slug uniqueness:", existingError);
                        throw existingError;
                    }
                    if (!existing) {
                        return [3 /*break*/, 3];
                    }
                    counter++;
                    slug = "".concat(baseSlug, "-").concat(counter);
                    return [3 /*break*/, 1];
                case 3:
                    invitationToInsert = (0, default_invitation_1.createDefaultInvitation)({
                        slug: slug,
                        template: data.template,
                        title: data.title,
                        description: data.description,
                        url: data.url,
                        ogImage: data.ogImage,
                    });
                    return [4 /*yield*/, supabaseAdmin
                            .from("invitations")
                            .insert(invitationToInsert)
                            .select()
                            .single()];
                case 4:
                    _b = _c.sent(), inserted = _b.data, error = _b.error;
                    if (error) {
                        console.error("Failed to create invitation:", error);
                        throw error;
                    }
                    if (!inserted) {
                        throw new Error("Created invitation not found");
                    }
                    return [2 /*return*/, inserted];
            }
        });
    });
}
/**
 * Update an invitation by ID.
 */
function updateInvitation(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        var allowedTemplates, supabaseAdmin, existing, newMeta, newTemplate, _a, updated, error;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!supabase_2.isSupabaseConfigured) {
                        throw new Error("Supabase not configured");
                    }
                    // Validate input
                    if (data.title === undefined || data.title === null || data.title.trim() === "") {
                        throw new Error("Title is required and must be a non-empty string");
                    }
                    if (data.description !== undefined && data.description !== null && typeof data.description !== "string") {
                        throw new Error("Description must be a string if provided");
                    }
                    if (data.url !== undefined && data.url !== null && typeof data.url !== "string") {
                        throw new Error("URL must be a string if provided");
                    }
                    if (data.ogImage !== undefined && data.ogImage !== null && typeof data.ogImage !== "string") {
                        throw new Error("OG Image must be a string if provided");
                    }
                    if (data.template !== undefined && data.template !== null) {
                        allowedTemplates = ["ayutika", "template02"];
                        if (!allowedTemplates.includes(data.template)) {
                            throw new Error("Invalid template");
                        }
                    }
                    supabaseAdmin = (0, supabase_admin_1.getSupabaseAdmin)();
                    return [4 /*yield*/, getInvitationById(id)];
                case 1:
                    existing = _g.sent();
                    if (!existing) {
                        throw new Error("Invitation not found");
                    }
                    newMeta = __assign(__assign({}, existing.meta), { title: (_b = data.title) !== null && _b !== void 0 ? _b : existing.meta.title, description: (_c = data.description) !== null && _c !== void 0 ? _c : existing.meta.description, url: (_d = data.url) !== null && _d !== void 0 ? _d : existing.meta.url, ogImage: (_e = data.ogImage) !== null && _e !== void 0 ? _e : existing.meta.ogImage });
                    newTemplate = (_f = data.template) !== null && _f !== void 0 ? _f : existing.template;
                    return [4 /*yield*/, supabaseAdmin
                            .from("invitations")
                            .update({
                            meta: newMeta,
                            template: newTemplate,
                            updated_at: new Date().toISOString(),
                        })
                            .eq("id", id)
                            .select()
                            .single()];
                case 2:
                    _a = _g.sent(), updated = _a.data, error = _a.error;
                    if (error) {
                        console.error("Failed to update invitation:", error);
                        throw error;
                    }
                    if (!updated) {
                        throw new Error("Updated invitation not found");
                    }
                    return [2 /*return*/, updated];
            }
        });
    });
}
/**
 * Delete an invitation by ID.
 */
function deleteInvitation(id) {
    return __awaiter(this, void 0, void 0, function () {
        var supabaseAdmin, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!supabase_2.isSupabaseConfigured) {
                        throw new Error("Supabase not configured");
                    }
                    supabaseAdmin = (0, supabase_admin_1.getSupabaseAdmin)();
                    return [4 /*yield*/, supabaseAdmin
                            .from("invitations")
                            .delete()
                            .eq("id", id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error("Failed to delete invitation:", error);
                        throw error;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get an invitation by ID.
 * Uses service role client to bypass RLS.
 */
function getInvitationById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var supabaseAdmin, _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!supabase_2.isSupabaseConfigured) {
                        return [2 /*return*/, null];
                    }
                    supabaseAdmin = (0, supabase_admin_1.getSupabaseAdmin)();
                    return [4 /*yield*/, supabaseAdmin
                            .from("invitations")
                            .select("*")
                            .eq("id", id)
                            .maybeSingle()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        if (error.code === "PGRST116") {
                            // Not found
                            return [2 /*return*/, null];
                        }
                        console.error("Failed to fetch invitation by ID:", error);
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, data];
            }
        });
    });
}
