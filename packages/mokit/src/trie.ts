import Result from "./result";

class TrieNode {
    private children = new Map();
    public endFlag = false
    public data: object = {};

    getChild(letter: string) {
        return this.children.get(letter);
    }

    addChild(letter: string) {
        let child = this.children.get(letter)
        if (!child) {
            child = new TrieNode();
            this.children.set(letter, child);
        }
        return child;
    }

}

export default class Trie {
    private root = new TrieNode();

    add(word: string, data: object) {
        word = word?.trim()?.toLowerCase();
        if (!word) {
            return;
        }

        let node = this.root;
        for (const letter of word) {
            node = node.getChild(letter) ?? node.addChild(letter);
        }
        node.endFlag = true;
        node.data = data;
    }

    contains(sentence: string) {
        sentence = sentence?.trim()?.toLowerCase();
        if (!sentence) {
            return Result.failed();
        }

        for (let i = 0; i < sentence.length; i++) {
            let node = this.root;
            for (let j = i; j < sentence.length; j++) {
                const child = node.getChild(sentence[j]);
                if (!child) {
                    break;
                }

                node = child;
                if (node.endFlag) {
                    return Result.success(node.data);
                }
            }
        }
        return Result.failed();
    }

}