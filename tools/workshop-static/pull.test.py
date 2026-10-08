import importlib.util
import pathlib
import unittest

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


if __name__=='__main__': unittest.main()
