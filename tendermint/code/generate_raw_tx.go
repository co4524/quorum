package main

import (
	"bytes"
    "fmt"
    "math/big"
	"crypto/sha256"
	"os"
	"encoding/json"
	"io/ioutil"
	"log"
	"bufio"
	"regexp"
	"strings"

    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/core/types"
    "github.com/ethereum/go-ethereum/crypto"
)

var option = struct {
	amount int64
	chainID int64
	gasLimit int
	gasPrice int64
	recAddress string
	dataSize int
	raw_txs_num int
}{
	amount: 1000,
	chainID: 3,
	gasLimit: 100000,
	gasPrice: 20000000000,
	recAddress: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
	dataSize: 106,
	raw_txs_num: 1000000,
}

type Consensus struct {
	Tendermint Tendermint `json:"tendermint"`
}

type Tendermint struct {
	Path Path `json:path`
}

type Path struct {
	PrivKey string `json:"private_key"`
	OutputFile string `json:"raw_tx_hash"`
}

func main() {

	// read config JSON file
	config, err := os.Open("../../configure.json")
	if err != nil {
		fmt.Println(err)
	}
	defer config.Close()
	byteValue, _  := ioutil.ReadAll(config)
	var tender Consensus
	json.Unmarshal(byteValue, &tender)

	_ = err
	fmt.Println(tender.Tendermint.Path.OutputFile)
	// read privKey file
	file, err := os.Open(tender.Tendermint.Path.PrivKey)
	if err != nil{
		log.Fatal(err)
	}
	defer file.Close()

	fmt.Println("work1")
	// parsing key (buffer to string)
	var senderPrivKey []string
	rule := regexp.MustCompile("0x([0-9,a-z]+)")
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		str := rule.FindAllStringSubmatchIndex(scanner.Text(), -1)
		key := ""
		for i := 0; i < len(str); i++{
			key = fmt.Sprintf("%s%c%c", key, scanner.Text()[str[i][2]] , scanner.Text()[str[i][3]-1])
		}
		senderPrivKey = append(senderPrivKey, key)
	}
	fmt.Println("work2")
	// generate txs
	data := make([]byte, option.dataSize)
	for i := 0; i< len(data); i++{   // tx's data fill with 1
		data[i] = 17
	}
	var raw_tx = []byte(`{}`)
	var raw_tx_list map[string]interface{}
	err1 := json.Unmarshal(raw_tx, &raw_tx_list)
	_ = err1
	for i := 0; i< option.raw_txs_num ; i++{
		tx := fmt.Sprintf("%x", genRawTransaction(senderPrivKey[i%len(senderPrivKey)] , uint64(i/len(senderPrivKey)) , data))
		raw_tx_list[tx] = strings.ToUpper(fmt.Sprintf("%x", sha256.Sum256([]byte(tx))))
	}
	raw_tx_json, _ := json.Marshal(raw_tx_list)
	_ = err
	_ = ioutil.WriteFile(tender.Tendermint.Path.OutputFile, raw_tx_json, 0644)
	fmt.Println("work3")

	// Debug
	//tx := genRawTransaction(senderPrivKey[0] , 3 , data)   //  key , nonce , data
	//fmt.Printf("sha256  %x\n", sha256.Sum256([]byte(fmt.Sprintf("%x", tx))))
	//fmt.Println(fmt.Sprintf("%x", tx))
	//fmt.Printf("txLength: %d\n", len(tx))

}

func genRawTransaction(private_key string, nonce uint64, data []byte) []byte{

	var buff bytes.Buffer
	senderPrivKey, _ := crypto.HexToECDSA(private_key)
    tx := types.NewTransaction(
		nonce,
		common.HexToAddress(option.recAddress),
		big.NewInt(option.amount),
		uint64(option.gasLimit),
		big.NewInt(option.gasPrice),
		data)

    signer := types.NewEIP155Signer(big.NewInt(option.chainID))
    signedTx, _ := types.SignTx(tx, signer, senderPrivKey)
    signedTx.EncodeRLP(&buff)
	return buff.Bytes()
}
