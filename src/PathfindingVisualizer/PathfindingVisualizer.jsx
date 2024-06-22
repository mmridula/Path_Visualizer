import React, { Component } from 'react';
import Node from './Node/Node';
import { dijkstra, getNodesInShortestPathOrder } from '../algorithms/dijkstra.js';
import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

class PathfindingVisualizer extends Component {
    constructor() {
        super();
        this.state = {
            grid: [],
            mouseIsPressed: false,
            startNode: { row: START_NODE_ROW, col: START_NODE_COL },
            finishNode: { row: FINISH_NODE_ROW, col: FINISH_NODE_COL },
            settingStartNode: false,
            settingFinishNode: false,
        };
    }

    componentDidMount() {
        const { startNode, finishNode } = this.state;
        const grid = this.getInitialGrid(startNode, finishNode);
        this.setState({ grid });
    }

    handleSetStartNode(row, col) {
        const newGrid = this.state.grid.slice();
        newGrid[this.state.startNode.row][this.state.startNode.col].isStart = false;
        newGrid[row][col].isStart = true;
        this.setState({ startNode: { row, col }, grid: newGrid, settingStartNode: false });
    }

    handleSetFinishNode(row, col) {
        const newGrid = this.state.grid.slice();
        newGrid[this.state.finishNode.row][this.state.finishNode.col].isFinish = false;
        newGrid[row][col].isFinish = true;
        this.setState({ finishNode: { row, col }, grid: newGrid, settingFinishNode: false });
    }

    handleMouseDown(row, col) {
        if (this.state.settingStartNode) {
            this.handleSetStartNode(row, col);
        } else if (this.state.settingFinishNode) {
            this.handleSetFinishNode(row, col);
        } else {
            const newGrid = this.getNewGridWithWallToggled(this.state.grid, row, col);
            this.setState({ grid: newGrid, mouseIsPressed: true });
        }
    }

    visualizeDijkstra() {
        const { grid, startNode, finishNode } = this.state;
        const startNodeObj = grid[startNode.row][startNode.col];
        const finishNodeObj = grid[finishNode.row][finishNode.col];
        const visitedNodesInOrder = dijkstra(grid, startNodeObj, finishNodeObj);
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeObj);
        this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, 10 * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className =
                    'node node-visited';
            }, 10 * i);
        }
    }

    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                document.getElementById(`node-${node.row}-${node.col}`).className =
                    'node node-shortest-path';
            }, 50 * i);
        }
    }

    handleMouseEnter(row, col) {
        if (!this.state.mouseIsPressed) return;
        const newGrid = this.state.settingStartNode
            ? this.getNewGridWithStartNode(this.state.grid, row, col)
            : this.state.settingFinishNode
                ? this.getNewGridWithFinishNode(this.state.grid, row, col)
                : this.getNewGridWithWallToggled(this.state.grid, row, col);
        this.setState({ grid: newGrid });
    }

    handleMouseUp() {
        this.setState({ mouseIsPressed: false });
    }

    getInitialGrid(startNode, finishNode) {
        const grid = [];
        for (let row = 0; row < 20; row++) {
            const currentRow = [];
            for (let col = 0; col < 50; col++) {
                currentRow.push(this.createNode(col, row, startNode, finishNode));
            }
            grid.push(currentRow);
        }
        return grid;
    }

    createNode(col, row, startNode, finishNode) {
        return {
            col,
            row,
            isStart: row === startNode.row && col === startNode.col,
            isFinish: row === finishNode.row && col === finishNode.col,
            distance: Infinity,
            isVisited: false,
            isWall: false,
            previousNode: null,
        };
    }

    getNewGridWithWallToggled(grid, row, col) {
        const newGrid = grid.slice();
        const node = newGrid[row][col];
        const newNode = {
            ...node,
            isWall: !node.isWall,
        };
        newGrid[row][col] = newNode;
        return newGrid;
    }

    render() {
        const { grid, mouseIsPressed, settingStartNode, settingFinishNode } = this.state;

        return (
            <>
                <button onClick={() => this.visualizeDijkstra()}>
                    Visualize Dijkstra's Algorithm
                </button>
                <button onClick={() => this.setState({ settingStartNode: !settingStartNode, settingFinishNode: false })}>
                    {settingStartNode ? "Click to Place Start Node" : "Set Start Node"}
                </button>
                <button onClick={() => this.setState({ settingFinishNode: !settingFinishNode, settingStartNode: false })}>
                    {settingFinishNode ? "Click to Place Finish Node" : "Set Finish Node"}
                </button>
                <div className="grid">
                    {grid.map((row, rowIdx) => {
                        return (
                            <div key={rowIdx}>
                                {row.map((node, nodeIdx) => {
                                    const { row, col, isFinish, isStart, isWall } = node;
                                    return (
                                        <Node
                                            key={nodeIdx}
                                            col={col}
                                            isFinish={isFinish}
                                            isStart={isStart}
                                            isWall={isWall}
                                            mouseIsPressed={mouseIsPressed}
                                            onMouseDown={() => this.handleMouseDown(row, col)}
                                            onMouseEnter={() => this.handleMouseEnter(row, col)}
                                            onMouseUp={() => this.handleMouseUp()}
                                            row={row}></Node>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </>
        );
    }
}

export default PathfindingVisualizer;
