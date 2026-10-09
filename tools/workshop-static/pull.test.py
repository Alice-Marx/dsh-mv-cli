import importlib.util
import pathlib
import unittest
import tempfile
import hashlib
import ssl
import urllib.error

spec = importlib.util.spec_from_file_location('workshop_pull', pathlib.Path(__file__).with_name('pull.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class InventoryTests(unittest.TestCase):
    def index(self):
        return {'format':'dsh-mv-workshop-index','version':1,'repo':'Alice-Marx/dsh-mv-workshop','commit':'a'*40,'packs':[{'id':'synthetic-pack','files':[{'path':'mv.json','size':10,'sha256':'b'*64}]}]}

    def test_good(self):
        self.assertEqual(module.inventory(self.index(), [])[0]['path'],'a'*40+'/packs/synthetic-pack/mv.json')

    def test_reject(self):
        for path in ('../escape.json','/root/key.pem','music.mp3','nested/.private.txt','a//b.json'):
            index=self.index(); index['packs'][0]['files'][0]['path']=path
            with self.assertRaises(ValueError): module.inventory(index, [])
        for size in (-1,True,33*1024*1024):
            index=self.index();index['packs'][0]['files'][0]['size']=size
            with self.assertRaises(ValueError): module.inventory(index, [])

    def test_duplicates_and_budgets(self):
        index=self.index();index['packs'].append(index['packs'][0])
        with self.assertRaises(ValueError): module.inventory(index, [])
        index=self.index();index['packs'][0]['files']*=161
        with self.assertRaises(ValueError): module.inventory(index, [])
        with self.assertRaises(ValueError): module.inventory(self.index(),[{'id':'synthetic-pack','path':'sources/other/source.zip','size':1,'sha256':'c'*64}])

    def test_retry_is_bounded_and_does_not_hide_integrity_or_tls(self):
        calls=[]
        def failure():
            calls.append(1); raise TimeoutError('synthetic')
        with self.assertRaises(TimeoutError): module.bounded_retry(failure, sleep=lambda _:None)
        self.assertEqual(len(calls),3)
        for error in (ValueError('hash'), ssl.SSLCertVerificationError('certificate'), urllib.error.HTTPError('https://example.invalid',451,'restricted',{},None)):
            calls.clear()
            def fixed():
                calls.append(1); raise error
            with self.assertRaises(type(error)): module.bounded_retry(fixed,sleep=lambda _:None)
            self.assertEqual(len(calls),1)
            if isinstance(error,urllib.error.HTTPError): error.close()

    def test_cache_reuses_only_verified_bytes_and_rejects_corruption(self):
        data=b'synthetic resource'; row={'size':len(data),'sha256':hashlib.sha256(data).hexdigest()}
        with tempfile.TemporaryDirectory() as directory:
            cache=pathlib.Path(directory)
            self.assertEqual(module.cache_bytes(cache,row,lambda:data),data)
            self.assertEqual(module.cache_bytes(cache,row,lambda: self.fail('unexpected network')),data)
            (cache/row['sha256']).write_bytes(b'corrupt')
            with self.assertRaises(ValueError): module.cache_bytes(cache,row,lambda:data)

    def test_bad_download_is_never_cached_and_same_path_hash_is_required(self):
        with tempfile.TemporaryDirectory() as directory:
            cache=pathlib.Path(directory);row={'size':3,'sha256':hashlib.sha256(b'abc').hexdigest()}
            with self.assertRaises(ValueError): module.cache_bytes(cache,row,lambda:b'bad')
            self.assertEqual(list(cache.iterdir()),[])
        a={'path':'a'*40+'/packs/example/mv.json','size':3,'sha256':'b'*64}
        b={**a,'path':'c'*40+'/packs/example/mv.json'}
        self.assertEqual(module.resource_key(a),module.resource_key(b))
        self.assertNotEqual(module.resource_key(a),module.resource_key({**b,'sha256':'d'*64}))


if __name__=='__main__': unittest.main()
