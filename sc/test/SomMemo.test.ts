import {expect} from "chai";
import {ethers} from "hardhat";
import {SomMemo, MockSomniaPreCompile} from "../typechain-types";
import {SignerWithAddress} from "@nomicfoundattion/hardhat-ethers/signers";

describe("SomMemo", function () {
    let somMemo: SomMemo;
    let mockPrecompile: MockSomniaPreCompile;
    let owner: SignerWithAddress;
    let beneficiary: SignerWithAddress;
    let hacker: SignerWithAddress;

    beforeEach(async function () {
        [owner, beneficiary, hacker] = await ethers.getSigners();
        const MockFactory = await ethers.getContractFactory("MockSomniaPreCompile");
        mockPrecompile = await MockFactory.deploy();
        await mockPrecompile.waitForDeployment();
        const mockAddress = await mockPrecompile.getAddress();
        const SomMemoFactory = await ethers.getContractFactory("SomMemo");
        somMemo = await SomMemoFactory.deploy(mockAddress);
        await somMemo.waitForDeployment();
    });

    //test registerWill
    describe("registerWill", function (){
        it("should register a new will succesfully", async function () {
            await somMemo.connect(owner).registerWill(beneficiary.address, 30);
            const info = await somMemo.getWillInfo(owner.address);
            expect(info.beneficiary).to.equal(beneficiary.address);
            expect(info.active).to.equal(true);
            expect(info.executed).to.equal(false);
        });

        it("should fail if beneficiary = self", async function () {
            await expect(
                somMemo.connect(owner).registerWill(owner.address, 30)
            ).to.be.revertedWith("SomMemo: Beneficiary cannot be the same as owner");
        });

        it("should fail if period is not valid", async function () {
            await expect(
                somMemo.connect(owner).registerWill(beneficiary.address, 45)
            ).to.be.revertedWith("SomMemo: Period is not valid");
        });

        it("should fail if will already exists", async function () {
            await somMemo.connect(owner).registerWill(beneficiary.address, 30);
            await expect (
                somMemo.connect(owner).registerWill(beneficiary.address, 90)
            ).to.be.revertedWith("SomMemo: Will already registered");
        });     
    });
    
    //test depositSTT
    describe("depositSTT", function () {
        beforeEach(async function () {
            await somMemo.connect(owner).registerWill(beneficiary.address, 30);
        });

        it("should add vault STT balance", async function () {
            const depositAmount = ethers.parseEther("1.0");
            await somMemo.connect(owner).depositSTT({value: depositAmount});
            const balance = await somMemo.vaultSTT(owner.address);
            expect(balance).to.equal(depositAmount);
        });

        it("should fail if deposit 0 STT", async function () {
            await expect(
                somMemo.connect(owner).depositSTT({value: 0})
            ).to.be.revertedWith("SomMemo: Amount must be greater than 0");
        });
    });

    //test checkIn

    describe("checkIn", function () {
        this.beforeEach(async function () {
            await somMemo.connect(owner).registerWill(beneficiary.address, 30);
        });

        it("should update lastCheckIn", async function () {
            const before = await somMemo.getWillInfo(owner.address);
            await somMemo.connect(owner).checkIn();
            const after = await somMemo.getWillInfo(owner.address);
            expect(after.lastCheckIn).to.be.greaterThanOrEqual(before.lastCheckIn);
        });
    });

    //test onEvent

    describe("onEvnt - inheritance execution", function () {
        it("should transfer STT to the beneficiary when the deadline is reached", async function () {

            await somMemo.connect(owner).registerWill(beneficiary.address, 30);
    
            const depositAmount = ethers.parseEther("1.0");
            await somMemo.connect(owner).depositSTT({ value: depositAmount });

            const vaultBalance = await somMemo.vaultSTT(owner.address);
            expect(vaultBalance).to.equal(depositAmount);

            await ethers.provider.send("evm_increaseTime", [31 * 24 * 60 * 60]);
            await ethers.provider.send("evm_mine", []);

            const somMemoAddress = await somMemo.getAddress();
            const balanceBefore = await ethers.provider.getBalance(beneficiary.address);
            await expect(
                mockPrecompile.triggerOnEvent(somMemoAddress, 1n)
            ).to.not.be.reverted;

            const balanceAfter = await ethers.provider.getBalance(beneficiary.address);
            expect(balanceAfter).to.be.greaterThan(balanceBefore);

            const willInfo = await somMemo.getWillInfo(owner.address);
            expect(willInfo.executed).to.equal(true);
        });
    });

    //test Security

    describe("Security", function () {
        it("onEvent with unregistered subscriptionId should do nothing", async function () {
            await somMemo.connect(owner).registerWill(beneficiary.address, 30);
            const depositAmount = ethers.parseEther("1.0");
            await somMemo.connect(owner).depositSTT({ value: depositAmount });

            // subscriptionId 999 tidak terdaftar → harus silent return, vault tidak berubah
            await expect(
                somMemo.connect(hacker).onEvent(999n, [], "0x")
            ).to.not.be.reverted;

            const vaultAfter = await somMemo.vaultSTT(owner.address);
            expect(vaultAfter).to.equal(depositAmount); // vault tidak berubah
        });
    });
});
