#!/usr/bin/env python3
"""
Blockchain Data Verification System
===================================

Enterprise-grade blockchain verification voor product authenticity:
- Smart contract integration voor tamper-proof data
- Cryptographic hashing voor data integrity
- Distributed ledger voor transparency
- Real-time verification API
- Audit trail voor compliance

Features:
- Ethereum/Polygon integration
- IPFS voor distributed storage
- Digital signatures
- Merkle tree verification
- Compliance reporting
"""

import hashlib
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import uuid
import hmac
import base64

# Blockchain imports
try:
    from web3 import Web3
    from eth_account import Account
    from eth_account.messages import encode_defunct
    WEB3_AVAILABLE = True
except ImportError:
    WEB3_AVAILABLE = False
    print("Web3 niet beschikbaar. Gebruik pip install web3")

try:
    import ipfshttpclient
    IPFS_AVAILABLE = True
except ImportError:
    IPFS_AVAILABLE = False
    print("IPFS client niet beschikbaar. Gebruik pip install ipfshttpclient")

logger = logging.getLogger(__name__)

@dataclass
class VerificationRecord:
    """Blockchain verification record"""
    record_id: str
    product_id: str
    data_hash: str
    merkle_root: str
    block_number: int
    transaction_hash: str
    timestamp: datetime
    verifier_address: str
    signature: str
    ipfs_hash: Optional[str] = None

@dataclass
class AuditTrail:
    """Audit trail voor compliance"""
    audit_id: str
    product_id: str
    action: str
    old_hash: str
    new_hash: str
    timestamp: datetime
    user_id: str
    verification_status: str

class MerkleTree:
    """
    Merkle Tree implementatie voor batch verification
    """
    
    def __init__(self, data_list: List[str]):
        self.data_list = data_list
        self.tree = self.build_tree()
        self.root = self.tree[0] if self.tree else None
    
    def hash_data(self, data: str) -> str:
        """Hash data met SHA-256"""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def build_tree(self) -> List[str]:
        """Bouw Merkle tree"""
        if not self.data_list:
            return []
        
        # Hash alle data items
        current_level = [self.hash_data(data) for data in self.data_list]
        tree = current_level.copy()
        
        # Bouw tree bottom-up
        while len(current_level) > 1:
            next_level = []
            
            # Pair up hashes
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                
                # Combine en hash
                combined = left + right
                parent_hash = hashlib.sha256(combined.encode()).hexdigest()
                next_level.append(parent_hash)
            
            tree.extend(next_level)
            current_level = next_level
        
        return tree
    
    def get_proof(self, data_index: int) -> List[Tuple[str, str]]:
        """Get Merkle proof voor data item"""
        if data_index >= len(self.data_list):
            return []
        
        proof = []
        current_index = data_index
        current_level_size = len(self.data_list)
        tree_index = 0
        
        while current_level_size > 1:
            # Find sibling
            if current_index % 2 == 0:
                # Left node, sibling is right
                sibling_index = current_index + 1
                if sibling_index < current_level_size:
                    sibling_hash = self.tree[tree_index + sibling_index]
                    proof.append((sibling_hash, 'right'))
            else:
                # Right node, sibling is left
                sibling_index = current_index - 1
                sibling_hash = self.tree[tree_index + sibling_index]
                proof.append((sibling_hash, 'left'))
            
            # Move to next level
            tree_index += current_level_size
            current_index = current_index // 2
            current_level_size = (current_level_size + 1) // 2
        
        return proof
    
    def verify_proof(self, data: str, proof: List[Tuple[str, str]]) -> bool:
        """Verificeer Merkle proof"""
        current_hash = self.hash_data(data)
        
        for sibling_hash, position in proof:
            if position == 'left':
                combined = sibling_hash + current_hash
            else:
                combined = current_hash + sibling_hash
            
            current_hash = hashlib.sha256(combined.encode()).hexdigest()
        
        return current_hash == self.root

class SmartContractInterface:
    """
    Interface voor smart contract interactie
    """
    
    def __init__(self, web3_provider: str, contract_address: str, private_key: str):
        self.w3 = None
        self.contract = None
        self.account = None
        
        if WEB3_AVAILABLE:
            try:
                self.w3 = Web3(Web3.HTTPProvider(web3_provider))
                self.account = Account.from_key(private_key)
                
                # Smart contract ABI (simplified)
                self.contract_abi = [
                    {
                        "inputs": [
                            {"name": "productId", "type": "string"},
                            {"name": "dataHash", "type": "string"},
                            {"name": "merkleRoot", "type": "string"}
                        ],
                        "name": "verifyProduct",
                        "outputs": [{"name": "", "type": "bool"}],
                        "type": "function"
                    },
                    {
                        "inputs": [{"name": "productId", "type": "string"}],
                        "name": "getVerification",
                        "outputs": [
                            {"name": "dataHash", "type": "string"},
                            {"name": "timestamp", "type": "uint256"},
                            {"name": "verified", "type": "bool"}
                        ],
                        "type": "function"
                    }
                ]
                
                self.contract = self.w3.eth.contract(
                    address=contract_address,
                    abi=self.contract_abi
                )
                
                logger.info("Smart contract interface geïnitialiseerd")
                
            except Exception as e:
                logger.error(f"Smart contract init error: {e}")
    
    def verify_product_on_chain(self, product_id: str, data_hash: str, 
                               merkle_root: str) -> Optional[str]:
        """
        Verificeer product op blockchain
        
        Args:
            product_id: Product ID
            data_hash: Data hash
            merkle_root: Merkle tree root
            
        Returns:
            Transaction hash of None
        """
        if not self.contract:
            logger.warning("Smart contract niet beschikbaar")
            return None
        
        try:
            # Build transaction
            transaction = self.contract.functions.verifyProduct(
                product_id, data_hash, merkle_root
            ).build_transaction({
                'from': self.account.address,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.account.address)
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction, private_key=self.account.key
            )
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for confirmation
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"Product verified on blockchain: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Blockchain verification error: {e}")
            return None
    
    def get_verification_status(self, product_id: str) -> Dict[str, Any]:
        """
        Haal verification status op van blockchain
        
        Args:
            product_id: Product ID
            
        Returns:
            Verification status
        """
        if not self.contract:
            return {'error': 'Smart contract niet beschikbaar'}
        
        try:
            result = self.contract.functions.getVerification(product_id).call()
            
            return {
                'product_id': product_id,
                'data_hash': result[0],
                'timestamp': datetime.fromtimestamp(result[1]),
                'verified': result[2],
                'block_number': self.w3.eth.block_number
            }
            
        except Exception as e:
            logger.error(f"Verification status error: {e}")
            return {'error': str(e)}

class IPFSStorage:
    """
    IPFS storage voor distributed data
    """
    
    def __init__(self, ipfs_node: str = '/ip4/127.0.0.1/tcp/5001'):
        self.client = None
        
        if IPFS_AVAILABLE:
            try:
                self.client = ipfshttpclient.connect(ipfs_node)
                logger.info("IPFS client geïnitialiseerd")
            except Exception as e:
                logger.error(f"IPFS init error: {e}")
    
    def store_product_data(self, product_data: Dict[str, Any]) -> Optional[str]:
        """
        Store product data op IPFS
        
        Args:
            product_data: Product data
            
        Returns:
            IPFS hash of None
        """
        if not self.client:
            logger.warning("IPFS client niet beschikbaar")
            return None
        
        try:
            # Convert naar JSON
            json_data = json.dumps(product_data, sort_keys=True, indent=2)
            
            # Upload naar IPFS
            result = self.client.add_json(product_data)
            ipfs_hash = result
            
            logger.info(f"Product data stored on IPFS: {ipfs_hash}")
            return ipfs_hash
            
        except Exception as e:
            logger.error(f"IPFS storage error: {e}")
            return None
    
    def retrieve_product_data(self, ipfs_hash: str) -> Optional[Dict[str, Any]]:
        """
        Haal product data op van IPFS
        
        Args:
            ipfs_hash: IPFS hash
            
        Returns:
            Product data of None
        """
        if not self.client:
            return None
        
        try:
            data = self.client.get_json(ipfs_hash)
            logger.info(f"Product data retrieved from IPFS: {ipfs_hash}")
            return data
            
        except Exception as e:
            logger.error(f"IPFS retrieval error: {e}")
            return None

class BlockchainDataVerifier:
    """
    Hoofdklasse voor blockchain-based data verification
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.smart_contract = None
        self.ipfs_storage = None
        self.verification_records = {}
        self.audit_trail = []
        
        # Initialize blockchain components
        if config.get('blockchain_enabled', False):
            self.smart_contract = SmartContractInterface(
                config['web3_provider'],
                config['contract_address'],
                config['private_key']
            )
        
        if config.get('ipfs_enabled', False):
            self.ipfs_storage = IPFSStorage(config.get('ipfs_node'))
        
        logger.info("Blockchain Data Verifier geïnitialiseerd")
    
    def create_product_verification(self, product_data: Dict[str, Any]) -> VerificationRecord:
        """
        Creëer complete product verification
        
        Args:
            product_data: Product data
            
        Returns:
            Verification record
        """
        try:
            # Generate unique record ID
            record_id = str(uuid.uuid4())
            
            # Create data hash
            data_hash = self._create_secure_hash(product_data)
            
            # Store op IPFS (optioneel)
            ipfs_hash = None
            if self.ipfs_storage:
                ipfs_hash = self.ipfs_storage.store_product_data(product_data)
            
            # Create Merkle tree voor batch verification
            merkle_tree = MerkleTree([json.dumps(product_data, sort_keys=True)])
            merkle_root = merkle_tree.root
            
            # Blockchain verification
            tx_hash = None
            block_number = 0
            if self.smart_contract:
                tx_hash = self.smart_contract.verify_product_on_chain(
                    product_data['id'], data_hash, merkle_root
                )
                if tx_hash:
                    block_number = self.smart_contract.w3.eth.block_number
            
            # Create digital signature
            signature = self._create_digital_signature(data_hash)
            
            # Create verification record
            verification_record = VerificationRecord(
                record_id=record_id,
                product_id=product_data['id'],
                data_hash=data_hash,
                merkle_root=merkle_root,
                block_number=block_number,
                transaction_hash=tx_hash or '',
                timestamp=datetime.now(),
                verifier_address=self.config.get('verifier_address', 'FitFi-AI'),
                signature=signature,
                ipfs_hash=ipfs_hash
            )
            
            # Store verification record
            self.verification_records[product_data['id']] = verification_record
            
            # Add to audit trail
            self._add_audit_entry(
                product_data['id'], 'created', '', data_hash, 'verified'
            )
            
            logger.info(f"Product verification created: {product_data['id']}")
            return verification_record
            
        except Exception as e:
            logger.error(f"Verification creation error: {e}")
            raise
    
    def verify_product_integrity(self, product_id: str, 
                               current_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verificeer product data integrity
        
        Args:
            product_id: Product ID
            current_data: Huidige product data
            
        Returns:
            Verification resultaat
        """
        try:
            # Haal stored verification op
            if product_id not in self.verification_records:
                return {
                    'verified': False,
                    'error': 'Geen verification record gevonden'
                }
            
            stored_record = self.verification_records[product_id]
            
            # Bereken current hash
            current_hash = self._create_secure_hash(current_data)
            
            # Vergelijk hashes
            hash_match = current_hash == stored_record.data_hash
            
            # Blockchain verification
            blockchain_status = {}
            if self.smart_contract:
                blockchain_status = self.smart_contract.get_verification_status(product_id)
            
            # IPFS verification
            ipfs_verified = False
            if self.ipfs_storage and stored_record.ipfs_hash:
                ipfs_data = self.ipfs_storage.retrieve_product_data(stored_record.ipfs_hash)
                if ipfs_data:
                    ipfs_hash = self._create_secure_hash(ipfs_data)
                    ipfs_verified = ipfs_hash == stored_record.data_hash
            
            # Signature verification
            signature_valid = self._verify_digital_signature(
                stored_record.data_hash, stored_record.signature
            )
            
            verification_result = {
                'verified': hash_match and signature_valid,
                'hash_match': hash_match,
                'signature_valid': signature_valid,
                'blockchain_verified': blockchain_status.get('verified', False),
                'ipfs_verified': ipfs_verified,
                'stored_hash': stored_record.data_hash,
                'current_hash': current_hash,
                'verification_timestamp': stored_record.timestamp,
                'block_number': stored_record.block_number,
                'transaction_hash': stored_record.transaction_hash
            }
            
            # Add to audit trail
            status = 'verified' if verification_result['verified'] else 'failed'
            self._add_audit_entry(
                product_id, 'verified', stored_record.data_hash, current_hash, status
            )
            
            return verification_result
            
        except Exception as e:
            logger.error(f"Verification error: {e}")
            return {'verified': False, 'error': str(e)}
    
    def batch_verify_products(self, products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Batch verification van meerdere producten
        
        Args:
            products: List van product data
            
        Returns:
            Batch verification resultaat
        """
        try:
            # Create Merkle tree voor batch
            product_strings = [json.dumps(p, sort_keys=True) for p in products]
            merkle_tree = MerkleTree(product_strings)
            
            verification_results = {}
            
            for i, product in enumerate(products):
                product_id = product['id']
                
                # Get Merkle proof
                proof = merkle_tree.get_proof(i)
                
                # Verify individual product
                individual_result = self.verify_product_integrity(product_id, product)
                
                # Verify Merkle proof
                merkle_verified = merkle_tree.verify_proof(
                    json.dumps(product, sort_keys=True), proof
                )
                
                verification_results[product_id] = {
                    **individual_result,
                    'merkle_verified': merkle_verified,
                    'merkle_proof': proof
                }
            
            return {
                'batch_verified': all(r['verified'] for r in verification_results.values()),
                'merkle_root': merkle_tree.root,
                'individual_results': verification_results,
                'total_products': len(products),
                'verified_count': sum(1 for r in verification_results.values() if r['verified'])
            }
            
        except Exception as e:
            logger.error(f"Batch verification error: {e}")
            return {'batch_verified': False, 'error': str(e)}
    
    def _create_secure_hash(self, data: Dict[str, Any]) -> str:
        """Creëer secure hash van data"""
        # Sorteer data voor consistente hashing
        sorted_data = json.dumps(data, sort_keys=True)
        
        # Gebruik HMAC voor extra security
        secret_key = self.config.get('hash_secret', 'fitfi-secret-key').encode()
        hash_object = hmac.new(secret_key, sorted_data.encode(), hashlib.sha256)
        
        return hash_object.hexdigest()
    
    def _create_digital_signature(self, data_hash: str) -> str:
        """Creëer digital signature"""
        try:
            # Gebruik private key voor signing
            private_key = self.config.get('signing_key', 'default-key').encode()
            signature = hmac.new(private_key, data_hash.encode(), hashlib.sha256)
            
            return base64.b64encode(signature.digest()).decode()
            
        except Exception as e:
            logger.error(f"Digital signature error: {e}")
            return ''
    
    def _verify_digital_signature(self, data_hash: str, signature: str) -> bool:
        """Verificeer digital signature"""
        try:
            expected_signature = self._create_digital_signature(data_hash)
            return hmac.compare_digest(signature, expected_signature)
            
        except Exception as e:
            logger.error(f"Signature verification error: {e}")
            return False
    
    def _add_audit_entry(self, product_id: str, action: str, old_hash: str, 
                        new_hash: str, status: str) -> None:
        """Voeg entry toe aan audit trail"""
        audit_entry = AuditTrail(
            audit_id=str(uuid.uuid4()),
            product_id=product_id,
            action=action,
            old_hash=old_hash,
            new_hash=new_hash,
            timestamp=datetime.now(),
            user_id='system',
            verification_status=status
        )
        
        self.audit_trail.append(audit_entry)
    
    def get_audit_trail(self, product_id: Optional[str] = None) -> List[AuditTrail]:
        """
        Haal audit trail op
        
        Args:
            product_id: Optioneel product ID filter
            
        Returns:
            Audit trail entries
        """
        if product_id:
            return [entry for entry in self.audit_trail if entry.product_id == product_id]
        
        return self.audit_trail
    
    def export_verification_report(self, product_ids: List[str]) -> Dict[str, Any]:
        """
        Exporteer verification report voor compliance
        
        Args:
            product_ids: Product IDs om te rapporteren
            
        Returns:
            Compliance report
        """
        report = {
            'report_id': str(uuid.uuid4()),
            'generated_at': datetime.now().isoformat(),
            'products_verified': 0,
            'products_failed': 0,
            'blockchain_transactions': [],
            'audit_entries': [],
            'compliance_status': 'PASSED'
        }
        
        for product_id in product_ids:
            if product_id in self.verification_records:
                record = self.verification_records[product_id]
                
                # Check verification status
                current_status = self.verify_product_integrity(product_id, {})
                
                if current_status.get('verified', False):
                    report['products_verified'] += 1
                else:
                    report['products_failed'] += 1
                    report['compliance_status'] = 'FAILED'
                
                # Add blockchain transaction
                if record.transaction_hash:
                    report['blockchain_transactions'].append({
                        'product_id': product_id,
                        'transaction_hash': record.transaction_hash,
                        'block_number': record.block_number,
                        'timestamp': record.timestamp.isoformat()
                    })
        
        # Add relevant audit entries
        report['audit_entries'] = [
            {
                'audit_id': entry.audit_id,
                'product_id': entry.product_id,
                'action': entry.action,
                'timestamp': entry.timestamp.isoformat(),
                'status': entry.verification_status
            }
            for entry in self.audit_trail
            if entry.product_id in product_ids
        ]
        
        return report

def main():
    """
    Test functie voor blockchain verifier
    """
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Test configuratie
    config = {
        'blockchain_enabled': False,  # Disable voor test
        'ipfs_enabled': False,
        'hash_secret': 'test-secret-key',
        'signing_key': 'test-signing-key',
        'verifier_address': 'FitFi-Test-Verifier'
    }
    
    # Initialiseer verifier
    verifier = BlockchainDataVerifier(config)
    
    # Test product data
    test_product = {
        'id': 'test-product-123',
        'name': 'Test Nike Sneakers',
        'brand': 'Nike',
        'price': 120.0,
        'category': 'footwear'
    }
    
    # Create verification
    verification_record = verifier.create_product_verification(test_product)
    print(f"Verification created: {verification_record.record_id}")
    
    # Verify integrity
    verification_result = verifier.verify_product_integrity(
        test_product['id'], test_product
    )
    print(f"Verification result: {verification_result}")
    
    # Test batch verification
    batch_result = verifier.batch_verify_products([test_product])
    print(f"Batch verification: {batch_result}")
    
    # Export compliance report
    report = verifier.export_verification_report([test_product['id']])
    print(f"Compliance report: {json.dumps(report, indent=2)}")

if __name__ == "__main__":
    main()