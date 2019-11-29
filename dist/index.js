"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Created by ChengZheLin on 2019/6/3.
 * Features: index
 */
const core_1 = require("./core");
class Mint extends core_1.Tree {
    // 是否替换原文本敏感词
    constructor(keywords) {
        super();
        if (!(keywords instanceof Array && keywords.length >= 1)) {
            console.error('mint-filter：未将过滤词数组传入！');
            return;
        }
        // 创建Trie树
        for (let item of keywords) {
            if (!item)
                continue;
            item = item.toString();
            if (/[a-z]/i.test(item)) {
                // 有字母
                this.insert(item.toLocaleUpperCase());
            }
            else {
                this.insert(item);
            }
        }
        this.createFailureTable();
    }
    searchKey() {
    }
    filterFunc(word, every = false, replace = true) {
        let startIndex = 0;
        let endIndex = startIndex;
        const wordLen = word.length;
        let originalWord = word;
        let filterKeywords = [];
        word = word.toLocaleUpperCase();
        // 保存过滤文本
        let filterText = '';
        let keywords = '';
        // 是否通过，无敏感词
        let isPass = true;
        // 下一个Node与当前Node
        let searchNode = this.root;
        // let currNode: Node | boolean
        // 是否开始匹配
        let isStart = false;
        while (endIndex < wordLen) {
            let key = word[endIndex];
            let currNode = this.search(key, searchNode.children);
            filterText += key;
            // 判断是否找到
            if (currNode) {
                if (!isStart) {
                    startIndex = endIndex;
                    isStart = true;
                    keywords = '';
                }
                // 是否匹配成功
                if (isStart && currNode.word) {
                    isStart = isPass = false;
                    keywords += key;
                    console.log(startIndex, endIndex, key, filterText);
                    // console.log('*'.repeat(keywords.length))
                    filterKeywords.push(keywords);
                }
            }
            else if (isStart) {
                // 如果没有匹配到，走失配流程
                currNode = searchNode.failure;
                key = currNode.key;
                isStart = false;
                keywords = '';
                if (key !== 'root') {
                    startIndex = endIndex - 1;
                    isStart = true;
                }
                // 是否匹配成功
                if (currNode.word) {
                    console.log(startIndex, endIndex - 1, key, filterText);
                    isStart = isPass = false;
                    keywords += key;
                    // console.log('*'.repeat(keywords.length))
                    filterKeywords.push(keywords);
                    endIndex -= 2;
                    // filterText = filterText.substr(0, startIndex) + '*'.repeat(keywords.length)
                }
            }
            if (isStart)
                keywords += key;
            searchNode = currNode || this.root;
            endIndex++;
        }
        return {
            text: replace ? filterText : originalWord,
            filter: [...new Set(filterKeywords)],
            pass: isPass
        };
    }
    /**
     * 异步快速检测字符串是否无敏感词
     * @param word
     */
    every(word) {
        return Promise.resolve(this.filterFunc(word, true).pass);
    }
    /**
     * 同步快速检测字符串是否无敏感词
     * @param word
     */
    includes(word) {
        return !this.filterFunc(word, true).pass;
    }
    everySync(word) {
        return this.filterFunc(word, true).pass;
    }
    /**
     * 同步过滤方法
     * @param word
     * @param replace
     */
    filterSync(word, replace = true) {
        return this.filterFunc(word, false, replace);
    }
    /**
     * 异步过滤方法
     * @param word
     * @param replace
     */
    filter(word, replace = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this.filterFunc(word, false, replace));
        });
    }
}
if (require.main === module) {
    /* let m = new Mint(['的', '我的天'])
    console.log(m.filterSync('开我的地，哈哈哈我的天')) */
    let m = new Mint(['我的天', '的', '大龄哥', '大龄哥你好', 33]);
    console.log(m.filterSync('我的地啊，我的天啊，我的大龄哥啊，大龄哥你好啊33。'));
    // console.log(m.filterSync('这是另外的TEST字符串，aaaa也是敏感词，123456中也有敏感词'))
    // console.log(m.everySync('测试这条语句是否能通过，加上任意一个关键词京东'))
    // console.log(m.includes('测试这条语句是否能通过，加上任意一个关键词京东')
}
module.exports = Mint;
//# sourceMappingURL=index.js.map