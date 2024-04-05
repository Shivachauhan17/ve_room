"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const for_testing_1 = require("../utils/for_testing");
(0, node_test_1.describe)('average', () => {
    (0, node_test_1.test)('of one value is the value itself', () => {
        node_assert_1.default.strictEqual((0, for_testing_1.average)([1]), 1);
    });
    (0, node_test_1.test)('of many is calculated right', () => {
        node_assert_1.default.strictEqual((0, for_testing_1.average)([1, 2, 3, 4, 5, 6]), 3.5);
    });
    (0, node_test_1.test)('of empty array is zero', () => {
        node_assert_1.default.strictEqual((0, for_testing_1.average)([]), 0);
    });
});
